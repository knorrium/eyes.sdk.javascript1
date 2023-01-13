import type {EGClient, EGClientSettings} from './types'
import {type Logger} from '@applitools/logger'
import {makeServer} from './proxy-server'
import * as utils from '@applitools/utils'

export async function makeEGClient({
  settings,
  logger,
}: {
  settings?: Partial<EGClientSettings>
  logger?: Logger
} = {}): Promise<EGClient> {
  settings ??= {}
  settings.serverUrl ??= utils.general.getEnvValue('EG_SERVER_URL') ?? 'https://exec-wus.applitools.com'
  settings.tunnelUrl ??= utils.general.getEnvValue('EG_TUNNEL_URL')
  settings.proxy ??= utils.general.getEnvValue('PROXY_URL') ? {url: utils.general.getEnvValue('PROXY_URL')} : undefined
  settings.capabilities ??= {}
  settings.capabilities.eyesServerUrl ??=
    utils.general.getEnvValue('EYES_SERVER_URL') ??
    utils.general.getEnvValue('SERVER_URL') ??
    'https://eyesapi.applitools.com'
  settings.capabilities.apiKey ??= utils.general.getEnvValue('API_KEY')
  settings.capabilities.timeout ??= utils.general.getEnvValue('EG_TIMEOUT')
  settings.capabilities.inactivityTimeout ??= utils.general.getEnvValue('EG_INACTIVITY_TIMEOUT')
  settings.capabilities.useSelfHealing ??= utils.general.getEnvValue('USE_SELF_HEALING', 'boolean')

  const server = await makeServer({settings: settings as EGClientSettings, logger})
  return server
}
