import type {Target, ExtractTextSettings} from './types'
import {type MaybeArray} from '@applitools/utils'
import {type Logger} from '@applitools/logger'
import {type CoreRequests} from './server/requests'
import {transformTarget} from './utils/transform-target'
import * as utils from '@applitools/utils'

type Options = {
  requests: CoreRequests
  logger: Logger
}

export function makeExtractText({requests, logger: defaultLogger}: Options) {
  return async function extractText({
    target,
    settings,
    logger = defaultLogger,
  }: {
    target: Target
    settings: MaybeArray<ExtractTextSettings>
    logger?: Logger
  }): Promise<string[]> {
    logger.log('Command "extractText" is called with settings', settings)
    settings = utils.types.isArray(settings) ? settings : [settings]
    const results = await Promise.all(
      settings.map(async settings => {
        const account = await requests.getAccountInfo({settings, logger})
        settings.normalization ??= {}
        settings.normalization.limit = {
          maxImageHeight: Math.min(settings.normalization.limit?.maxImageHeight ?? Infinity, account.maxImageHeight),
          maxImageArea: Math.min(settings.normalization.limit?.maxImageArea ?? Infinity, account.maxImageArea),
        }
        target = await transformTarget({target, settings})
        return requests.extractText({target, settings, logger})
      }),
    )
    return results.flat()
  }
}
