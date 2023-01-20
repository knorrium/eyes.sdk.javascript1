import type {Core as BaseCore} from '@applitools/core-base'
import {type EGClient, type EGClientSettings} from '@applitools/execution-grid-client'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  core: BaseCore
  logger: Logger
}

export function makeMakeEGClient({core, logger: defaultLogger}: Options) {
  return async function makeEGClient({
    settings,
    logger = defaultLogger,
  }: {settings?: EGClientSettings; logger?: Logger} = {}): Promise<EGClient> {
    const {makeEGClient} = require('@applitools/execution-grid-client')
    const serverUrl =
      settings.capabilities.eyesServerUrl ??
      utils.general.getEnvValue('EYES_SERVER_URL') ??
      utils.general.getEnvValue('SERVER_URL') ??
      'https://eyesapi.applitools.com'
    const apiKey = (settings.capabilities.apiKey ??= utils.general.getEnvValue('API_KEY'))
    const proxy = settings.proxy ?? (utils.general.getEnvValue('PROXY_URL') && {url: utils.general.getEnvValue('PROXY_URL')})
    const account = await core.getAccountInfo({settings: {serverUrl, apiKey, proxy}, logger})
    settings.capabilities ??= {}
    settings.capabilities.useSelfHealing ??=
      utils.general.getEnvValue('USE_SELF_HEALING', 'boolean') ?? account.selfHealingEnabled
    const client = await makeEGClient({settings, logger})
    return client
  }
}
