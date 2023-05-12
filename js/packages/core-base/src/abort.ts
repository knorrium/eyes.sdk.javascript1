import type {AbortSettings} from './types'
import {type Logger} from '@applitools/logger'
import {type AbortController} from 'abort-controller'
import {type EyesRequests, type FunctionalSessionRequests} from './server/requests'
import * as utils from '@applitools/utils'

type Options = {
  requests: EyesRequests | FunctionalSessionRequests
  done: () => void
  controller: AbortController
  logger: Logger
}

export function makeAbort({requests, done, controller, logger: mainLogger}: Options) {
  return async function abort({
    settings,
    logger = mainLogger,
  }: {
    settings?: AbortSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`abort-base-${utils.general.shortid()}`]})

    logger.log('Command "abort" is called with settings', settings)
    controller.abort()
    requests.abort({settings, logger}).finally(done)
  }
}
