import type {CloseSettings} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests, type FunctionalSessionRequests} from './server/requests'
import * as utils from '@applitools/utils'

type Options = {
  requests: EyesRequests | FunctionalSessionRequests
  done: () => void
  logger: Logger
}

export function makeClose({requests, done, logger: mainLogger}: Options) {
  return async function close({
    settings,
    logger = mainLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`close-base-${utils.general.shortid()}`]})

    logger.log('Command "close" is called with settings', settings)
    requests.close({settings, logger}).finally(done)
  }
}
