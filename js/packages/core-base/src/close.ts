import type {CloseSettings} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeClose({requests, logger: defaultLogger}: Options) {
  return async function close({
    settings,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger.log('Command "close" is called with settings', settings)
    await requests.close({settings, logger})
  }
}
