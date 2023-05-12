import type {RendererSettings, RendererEnvironment} from './types'
import {type UFGRequests} from './server/requests'
import {mergeLoggers, type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  requests: UFGRequests
  batchingTimeout?: number
  logger: Logger
}

export function makeBookRenderer({requests, batchingTimeout = 100, logger: mainLogger}: Options) {
  const bookedRendererWithBatching = utils.general.batchify(bookRenderers, {timeout: batchingTimeout})

  return function bookRenderer({settings, logger = mainLogger}: {settings: RendererSettings; logger?: Logger}) {
    logger = logger.extend(mainLogger, {tags: [`book-renderer-${utils.general.shortid()}`]})
    return bookedRendererWithBatching({settings, logger})
  }

  async function bookRenderers(
    batch: [
      {settings: RendererSettings; logger: Logger},
      {resolve(result: RendererEnvironment): void; reject(reason?: any): void},
    ][],
  ) {
    const logger = mergeLoggers(...batch.map(([{logger}]) => logger))
    try {
      const bookedRenderers = await requests.bookRenderers({settings: batch.map(([{settings}]) => settings), logger})
      bookedRenderers.forEach((bookedRenderer, index) => {
        const [, {resolve}] = batch[index]
        resolve(bookedRenderer)
      })
    } catch (err) {
      batch.forEach(([, {reject}]) => reject(err))
    }
  }
}
