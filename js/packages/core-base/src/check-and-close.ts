import type {Target, CheckSettings, CloseSettings, TestResult} from './types'
import {type Logger} from '@applitools/logger'
import {type AbortSignal} from 'abort-controller'
import {type EyesRequests} from './server/requests'
import {transformTarget} from './utils/transform-target'

type Options = {
  requests: EyesRequests
  done: () => void
  signal: AbortSignal
  logger: Logger
}

export function makeCheckAndClose({requests, done, signal, logger: defaultLogger}: Options) {
  return async function checkAndClose({
    target,
    settings,
    logger = defaultLogger,
  }: {
    target: Target
    settings?: CheckSettings & CloseSettings
    logger?: Logger
  }): Promise<TestResult[]> {
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
