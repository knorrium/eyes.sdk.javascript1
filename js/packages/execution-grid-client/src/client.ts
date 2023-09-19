import type {ECClient, ECClientSettings} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeServer} from './server'
import * as utils from '@applitools/utils'

export async function makeECClient({
  settings,
  logger: defaultLogger,
}: {
  settings?: Partial<ECClientSettings>
  logger?: Logger
} = {}): Promise<ECClient> {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'ec-client'}})

  settings ??= {}
  settings.serverUrl ??=
    utils.general.getEnvValue('EXECUTION_CLOUD_URL') ??
    utils.general.getEnvValue('EG_SERVER_URL') ??
    'https://exec-wus.applitools.com'
  settings.proxy ??= utils.general.getEnvValue('PROXY_URL') ? {url: utils.general.getEnvValue('PROXY_URL')} : undefined
  settings.useDnsCache ??= utils.general.getEnvValue('USE_DNS_CACHE', 'boolean')
  settings.tunnel ??= {}
  settings.tunnel.serviceUrl ??= utils.general.getEnvValue('EG_TUNNEL_URL')
  settings.tunnel.groupSize ??= utils.general.getEnvValue('TUNNEL_GROUP_SIZE', 'number') ?? 2
  settings.tunnel.pool ??= {}
  settings.tunnel.pool.maxInuse ??= utils.general.getEnvValue('TUNNEL_POOL_MAX_INUSE', 'number') ?? 4
  settings.tunnel.pool.timeout ??= {}
  settings.tunnel.pool.timeout.idle ??= utils.general.getEnvValue('TUNNEL_POOL_TIMEOUT_IDLE', 'number') ?? 20 * 60_000
  settings.tunnel.pool.timeout.expiration ??=
    utils.general.getEnvValue('TUNNEL_POOL_TIMEOUT_EXPIRATION', 'number') ?? 20 * 60_000

  settings.options ??= {}
  settings.options.eyesServerUrl ??=
    utils.general.getEnvValue('EYES_SERVER_URL') ??
    utils.general.getEnvValue('SERVER_URL') ??
    'https://eyesapi.applitools.com'
  settings.options.apiKey ??= utils.general.getEnvValue('API_KEY')
  settings.options.region ??= utils.general.getEnvValue('EXECUTION_CLOUD_REGION') as 'us-west' | 'australia'
  settings.options.batch ??= {}
  settings.options.batch.id ??= utils.general.getEnvValue('BATCH_ID') ?? `generated-${utils.general.guid()}`
  settings.options.batch.name ??= utils.general.getEnvValue('BATCH_NAME')
  settings.options.batch.sequenceName ??= utils.general.getEnvValue('BATCH_SEQUENCE')
  settings.options.batch.notifyOnCompletion ??= utils.general.getEnvValue('BATCH_NOTIFY', 'boolean')
  settings.options.tunnel ??= utils.general.getEnvValue('TUNNEL', 'boolean')
  settings.options.useSelfHealing ??= utils.general.getEnvValue('USE_SELF_HEALING', 'boolean')
  settings.options.sessionName ??= utils.general.getEnvValue('SESSION_NAME')
  settings.options.timeout ??= utils.general.getEnvValue('EG_TIMEOUT', 'number')
  settings.options.inactivityTimeout ??= utils.general.getEnvValue('EG_INACTIVITY_TIMEOUT', 'number')

  const server = await makeServer({settings: settings as ECClientSettings, logger})
  return server
}
