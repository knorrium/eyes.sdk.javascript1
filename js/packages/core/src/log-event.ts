import type {MaybeArray} from '@applitools/utils'
import type {Core, LogEventSettings} from './types'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  core: Core<any>
  logger: Logger
}

export function makeLogEvent({core, logger: mainLogger}: Options) {
  return async function logEvent({
    settings,
    logger = mainLogger,
  }: {
    settings: MaybeArray<LogEventSettings>
    logger?: Logger
  }): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`log-event-${utils.general.shortid()}`]})
    ;(utils.types.isArray(settings) ? settings : [settings]).forEach(settings => {
      settings.eyesServerUrl ??=
        (settings as any).serverUrl ??
        utils.general.getEnvValue('EYES_SERVER_URL') ??
        utils.general.getEnvValue('SERVER_URL') ??
        'https://eyesapi.applitools.com'
      settings.apiKey ??= utils.general.getEnvValue('API_KEY')
    })

    return core.base.logEvent({settings, logger})
  }
}
