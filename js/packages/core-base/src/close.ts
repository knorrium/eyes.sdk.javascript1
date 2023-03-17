import type {CloseSettings} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'

type Options = {
  requests: EyesRequests
  done: () => void
  logger: Logger
}

export function makeClose({requests, done, logger: defaultLogger}: Options) {
  return async function close({
    settings,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger.log('Command "close" is called with settings', settings)
    requests.close({settings, logger}).finally(done)
  }
}
