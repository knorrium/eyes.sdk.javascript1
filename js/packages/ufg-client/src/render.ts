import type {RenderTarget, RenderSettings, RenderResult} from './types'
import {type AbortSignal} from 'abort-controller'
import {type UFGRequests, type StartedRender} from './server/requests'
import {mergeLoggers, type Logger} from '@applitools/logger'
import throat from 'throat'
import * as utils from '@applitools/utils'

type Options = {
  requests: UFGRequests
  concurrency?: number
  timeout?: number
  batchingTimeout?: number
  pollingTimeout?: number
  logger: Logger
}

export function makeRender({
  requests,
  concurrency = utils.general.getEnvValue('CONCURRENT_RENDERS_PER_TEST', 'number') ?? 1,
  timeout = 60 * 60 * 1000,
  batchingTimeout = 300,
  pollingTimeout = 500,
  logger: mainLogger,
}: Options) {
  const startRenderWithBatching = utils.general.batchify(startRenders, {timeout: batchingTimeout})
  const checkRenderResultWithBatching = utils.general.batchify(checkRenderResults, {timeout: batchingTimeout})

  const throttles = new Map<string, ReturnType<typeof throat>>()
  const renderWithConcurrency = utils.general.wrap(render, (render, options) => {
    let throttle = throttles.get(options.settings.renderEnvironmentId)
    if (!throttle) throttles.set(options.settings.renderEnvironmentId, (throttle = throat(concurrency)))
    return throttle(render, options)
  })

  return renderWithConcurrency

  async function render({
    target,
    settings,
    signal,
    logger = mainLogger,
  }: {
    target: RenderTarget
    settings: RenderSettings
    signal?: AbortSignal
    logger?: Logger
  }) {
    logger = logger.extend(mainLogger, {tags: [`render-${utils.general.shortid()}`]})

    const timedOutAt = Date.now() + timeout
    const render = await startRenderWithBatching({target, settings, logger})
    return checkRenderResultWithBatching({render, signal, timedOutAt, logger})
  }

  async function startRenders(
    batch: [
      {target: RenderTarget; settings: RenderSettings; logger: Logger},
      {resolve(result: StartedRender): void; reject(reason?: any): void},
    ][],
  ) {
    const logger = mergeLoggers(...batch.map(([{logger}]) => logger))

    try {
      const renders = await requests.startRenders({requests: batch.map(([request]) => request), logger})

      renders.forEach((render, index) => {
        const [, {resolve, reject}] = batch[index]
        if (render.status === 'need-more-resources') {
          logger.error(`Got unexpected status ${render.status} in start render response`)
          reject(new Error(`Got unexpected status ${render.status} in start render response`))
        } else {
          resolve(render)
        }
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }

  async function checkRenderResults(
    batch: [
      {render: StartedRender; signal?: AbortSignal; timedOutAt: number; logger: Logger},
      {resolve(result: RenderResult): void; reject(reason?: any): void},
    ][],
  ) {
    const logger = mergeLoggers(...batch.map(([{logger}]) => logger))

    try {
      batch = batch.filter(([{render, signal, timedOutAt}, {reject}]) => {
        if (signal?.aborted) {
          logger.warn(`Render with id "${render.renderId}" aborted`)
          reject(new Error(`Render with id "${render.renderId}" aborted`))
          return false
        } else if (Date.now() >= timedOutAt) {
          logger.error(`Render with id "${render.renderId}" timed out`)
          reject(new Error(`Render with id "${render.renderId}" timed out`))
          return false
        } else {
          return true
        }
      })
      const results = await requests.checkRenderResults({renders: batch.map(([{render}]) => render), logger})
      results.forEach(async (result, index) => {
        const [options, {resolve, reject}] = batch[index]
        if (result.status === 'error') {
          logger.error(`Render with id "${options.render.renderId}" failed due to an error - ${result.error}`)
          reject(new Error(`Render with id "${options.render.renderId}" failed due to an error - ${result.error}`))
        } else if (result.status === 'rendered') {
          resolve(result)
        } else {
          // NOTE: this may create a long promise chain
          await utils.general.sleep(pollingTimeout)
          checkRenderResultWithBatching(options).then(resolve, reject)
        }
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }
}
