import type {Target, CheckSettings, CheckResult} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'
import {transformTarget} from './utils/transform-target'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeCheck({requests, logger: defaultLogger}: Options) {
  return async function check({
    target,
    settings = {},
    logger = defaultLogger,
  }: {
    target: Target
    settings?: CheckSettings
    logger?: Logger
  }): Promise<CheckResult[]> {
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
    logger.log('Command "check" is called with settings', settings)
    target = await transformTarget({target, settings})
    return requests.check({target, settings, logger})
  }
}
