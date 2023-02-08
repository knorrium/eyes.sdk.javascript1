import type {AbortSettings} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeAbort({requests, logger: defaultLogger}: Options) {
  return async function abort({
    settings,
    logger = defaultLogger,
  }: {
    settings?: AbortSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger.log('Command "abort" is called with settings', settings)
    await requests.abort({settings, logger})
  }
}
