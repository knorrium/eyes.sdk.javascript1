import type {Target, CheckSettings, CloseSettings} from './types'
import {type Logger} from '@applitools/logger'
import {type AbortSignal} from 'abort-controller'
import {type EyesRequests} from './server/requests'
import {transformTarget} from './utils/transform-target'
import * as utils from '@applitools/utils'

type Options = {
  requests: EyesRequests
  done: () => void
  signal: AbortSignal
  logger: Logger
}

export function makeCheckAndClose({requests, done, signal, logger: mainLogger}: Options) {
  return async function checkAndClose({
    target,
    settings,
    logger = mainLogger,
  }: {
    target: Target
    settings?: CheckSettings & CloseSettings
    logger?: Logger
  }): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`check-and-close-base-${utils.general.shortid()}`]})

    settings ??= {}
    settings.normalization ??= {}
    settings.normalization.limit = {
      maxImageHeight: Math.min(
        settings.normalization.limit?.maxImageHeight ?? Infinity,
        requests.test.account.maxImageHeight,
      ),
      maxImageArea: Math.min(
        settings.normalization.limit?.maxImageArea ?? Infinity,
        requests.test.account.maxImageArea,
      ),
    }
    logger.log('Command "checkAndClose" is called with settings', settings)

    target = await transformTarget({target, settings})

    if (signal.aborted) {
      throw new Error('Command "checkAndClose" was aborted')
    }
    return requests.checkAndClose({target, settings, logger}).finally(done)
  }
}
