import type {Core, Account, EyesServerSettings} from './types'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  core: Core<any>
  logger: Logger
}

export function makeGetAccountInfo({core, logger: mainLogger}: Options) {
  return async function getAccountInfo({
    settings,
    logger = mainLogger,
  }: {
    settings: EyesServerSettings
    logger?: Logger
  }): Promise<Account> {
    logger = logger.extend(mainLogger, {tags: [`get-account-info-${utils.general.shortid()}`]})

    settings.eyesServerUrl ??=
      utils.general.getEnvValue('EYES_SERVER_URL') ??
      utils.general.getEnvValue('SERVER_URL') ??
      'https://eyesapi.applitools.com'
    settings.apiKey ??= utils.general.getEnvValue('API_KEY')

    return core.base.getAccountInfo({settings, logger})
  }
}
