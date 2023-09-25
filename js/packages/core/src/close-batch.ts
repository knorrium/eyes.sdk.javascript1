import type {MaybeArray} from '@applitools/utils'
import type {Core, CloseBatchSettings} from './types'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  core: Core<any>
  logger: Logger
}

export function makeCloseBatch({core, logger: mainLogger}: Options) {
  return async function closeBatch({
    settings,
    logger = mainLogger,
  }: {
    settings: MaybeArray<CloseBatchSettings>
    logger?: Logger
  }): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`close-batch-${utils.general.shortid()}`]})
    ;(utils.types.isArray(settings) ? settings : [settings]).forEach(settings => {
      settings.eyesServerUrl ??=
        utils.general.getEnvValue('EYES_SERVER_URL') ??
        utils.general.getEnvValue('SERVER_URL') ??
        'https://eyesapi.applitools.com'
      settings.apiKey ??= utils.general.getEnvValue('API_KEY')
    })

    return core.base.closeBatch({settings, logger})
  }
}
