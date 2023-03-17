import type {AbortSettings} from './types'
import {type Logger} from '@applitools/logger'
import {type AbortController} from 'abort-controller'
import {type EyesRequests} from './server/requests'

type Options = {
  requests: EyesRequests
  done: () => void
  controller: AbortController
  logger: Logger
}

export function makeAbort({requests, done, controller, logger: defaultLogger}: Options) {
  return async function abort({
    settings,
    logger = defaultLogger,
  }: {
    settings?: AbortSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger.log('Command "abort" is called with settings', settings)
    controller.abort()
    requests.abort({settings, logger}).finally(done)
  }
}
