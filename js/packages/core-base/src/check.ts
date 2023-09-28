import type {Target, CheckSettings} from './types'
import {type AbortSignal} from 'abort-controller'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'
import {transformTarget} from './utils/transform-target'
import {transformDomMapping} from './utils/transform-dom-mapping'
import * as utils from '@applitools/utils'

type Options = {
  requests: EyesRequests
  signal: AbortSignal
  logger: Logger
}

export function makeCheck({requests, signal, logger: mainLogger}: Options) {
  const queue = [] as (PromiseLike<void> & {resolve(): void})[]

  return async function check({
    target,
    settings = {},
    logger = mainLogger,
  }: {
    target: Target
    settings?: CheckSettings
    logger?: Logger
  }): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`check-base-${utils.general.shortid()}`]})

    settings ??= {}
    settings.stepIndex ??= queue.length
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
    await transformDomMapping(settings)
    logger.log('Command "check" is called with settings', settings)

    queue[settings.stepIndex] ??= utils.promises.makeControlledPromise()
    const aborted = new Promise<never>((_, reject) => {
      const abort = () => reject(new Error('Command "check" was aborted due to possible error in previous step'))
      signal.addEventListener('abort', abort)
      if (signal.aborted) abort()
    })

    target = await transformTarget({target, settings})

    if (settings.stepIndex > 0) {
      await Promise.race([(queue[settings.stepIndex - 1] ??= utils.promises.makeControlledPromise()), aborted])
    }

    return Promise.race([requests.check({target, settings, logger}), aborted]).finally(
      queue[settings.stepIndex].resolve,
    )
  }
}
