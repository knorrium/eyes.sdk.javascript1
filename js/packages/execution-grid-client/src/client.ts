import type {ECClient, ECClientSettings} from './types'
import {type Logger} from '@applitools/logger'
import {makeServer} from './proxy-server'
import * as utils from '@applitools/utils'

export async function makeECClient({
  settings,
  logger,
}: {
  settings?: Partial<ECClientSettings>
  logger?: Logger
} = {}): Promise<ECClient> {
  settings ??= {}
  settings.serverUrl ??= utils.general.getEnvValue('EG_SERVER_URL') ?? 'https://exec-wus.applitools.com'
  settings.proxy ??= utils.general.getEnvValue('PROXY_URL') ? {url: utils.general.getEnvValue('PROXY_URL')} : undefined
  settings.tunnel ??= {}
  settings.tunnel.serverUrl ??= utils.general.getEnvValue('EG_TUNNEL_URL')
  settings.tunnel.groupSize ??= utils.general.getEnvValue('TUNNEL_GROUP_SIZE', 'number') ?? 2
  settings.tunnel.pool ??= {}
  settings.tunnel.pool.maxInuse ??= utils.general.getEnvValue('TUNNEL_POOL_MAX_INUSE', 'number') ?? 4
  settings.tunnel.pool.timeout ??= {}
  settings.tunnel.pool.timeout.idle ??= utils.general.getEnvValue('TUNNEL_POOL_TIMEOUT_IDLE', 'number') ?? 10 * 60_000
  settings.tunnel.pool.timeout.expiration ??=
    utils.general.getEnvValue('TUNNEL_POOL_TIMEOUT_EXPIRATION', 'number') ?? 30_000

  settings.capabilities ??= {}
  settings.capabilities.eyesServerUrl ??=
    utils.general.getEnvValue('EYES_SERVER_URL') ??
    utils.general.getEnvValue('SERVER_URL') ??
    'https://eyesapi.applitools.com'
  settings.capabilities.apiKey ??= utils.general.getEnvValue('API_KEY')
  settings.capabilities.tunnel ??= utils.general.getEnvValue('TUNNEL', 'boolean')
  settings.capabilities.useSelfHealing ??= utils.general.getEnvValue('USE_SELF_HEALING', 'boolean')
  settings.capabilities.sessionName ??= utils.general.getEnvValue('SESSION_NAME')
  settings.capabilities.timeout ??= utils.general.getEnvValue('EG_TIMEOUT', 'number')
  settings.capabilities.inactivityTimeout ??= utils.general.getEnvValue('EG_INACTIVITY_TIMEOUT', 'number')

  const server = await makeServer({settings: settings as ECClientSettings, logger})
  return server
}
