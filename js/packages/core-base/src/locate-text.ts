import type {Target, LocateTextSettings, LocateTextResult} from './types'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import {transformTarget} from './utils/transform-target'
import * as utils from '@applitools/utils'

type Options = {
  requests: CoreRequests
  logger: Logger
}

export function makeLocateText({requests, logger: mainLogger}: Options) {
  return async function locateText<TPattern extends string>({
    target,
    settings,
    logger = mainLogger,
  }: {
    target: Target
    settings: LocateTextSettings<TPattern>
    logger?: Logger
  }): Promise<LocateTextResult<TPattern>> {
    logger = logger.extend(mainLogger, {tags: [`locate-text-base-${utils.general.shortid()}`]})

    const account = await requests.getAccountInfo({settings, logger})
    settings.normalization ??= {}
    settings.normalization.limit = {
      maxImageHeight: Math.min(settings.normalization.limit?.maxImageHeight ?? Infinity, account.maxImageHeight),
      maxImageArea: Math.min(settings.normalization.limit?.maxImageArea ?? Infinity, account.maxImageArea),
    }
    logger.log('Command "locateText" is called with settings', settings)
    target = await transformTarget({target, settings})
    const results = await requests.locateText({target, settings, logger})
    return results
  }
}
