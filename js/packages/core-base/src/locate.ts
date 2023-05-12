import type {Target, LocateSettings, LocateResult} from './types'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import {transformTarget} from './utils/transform-target'
import * as utils from '@applitools/utils'

type Options = {
  requests: CoreRequests
  logger: Logger
}

export function makeLocate({requests, logger: mainLogger}: Options) {
  return async function locate<TLocator extends string>({
    target,
    settings,
    logger = mainLogger,
  }: {
    target: Target
    settings: LocateSettings<TLocator>
    logger?: Logger
  }): Promise<LocateResult<TLocator>> {
    logger = logger.extend(mainLogger, {tags: [`locate-base-${utils.general.shortid()}`]})

    const account = await requests.getAccountInfo({settings, logger})
    settings.normalization ??= {}
    settings.normalization.limit = {
      maxImageHeight: Math.min(settings.normalization.limit?.maxImageHeight ?? Infinity, account.maxImageHeight),
      maxImageArea: Math.min(settings.normalization.limit?.maxImageArea ?? Infinity, account.maxImageArea),
    }
    logger.log('Command "locate" is called with settings', settings)
    target = await transformTarget({target, settings})
    const results = await requests.locate({target, settings, logger})
    return results
  }
}
