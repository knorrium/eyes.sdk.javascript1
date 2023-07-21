import type {RenderEnvironmentSettings, RenderEnvironment} from './types'
import {type UFGRequests} from './server/requests'
import {mergeLoggers, type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  requests: UFGRequests
  batchingTimeout?: number
  logger: Logger
}

export function makeGetRenderEnvironment({requests, batchingTimeout = 100, logger: mainLogger}: Options) {
  const bookedRendererWithBatching = utils.general.batchify(getRenderEnvironments, {timeout: batchingTimeout})

  return function getRenderEnvironment({
    settings,
    logger = mainLogger,
  }: {
    settings: RenderEnvironmentSettings
    logger?: Logger
  }) {
    logger = logger.extend(mainLogger, {tags: [`book-renderer-${utils.general.shortid()}`]})
    return bookedRendererWithBatching({settings, logger})
  }

  async function getRenderEnvironments(
    batch: [
      {settings: RenderEnvironmentSettings; logger: Logger},
      {resolve(result: RenderEnvironment): void; reject(reason?: any): void},
    ][],
  ) {
    const logger = mergeLoggers(...batch.map(([{logger}]) => logger))
    try {
      const environments = await requests.getRenderEnvironments({
        settings: batch.map(([{settings}]) => settings),
        logger,
      })
      environments.forEach((environment, index) => {
        const [, {resolve}] = batch[index]
        resolve(environment)
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }
}
