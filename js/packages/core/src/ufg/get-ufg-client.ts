import {type Logger} from '@applitools/logger'
import {type AsyncCache, makeUFGClient, type UFGClient, type UFGClientSettings} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'

type Options = {
  client?: UFGClient
  fetchConcurrency?: number
  logger: Logger
  asyncCache?: AsyncCache
}

export function makeGetUFGClient({client, fetchConcurrency, logger: mainLogger, asyncCache}: Options) {
  // we are caching by the server config, therefor if the user creates another Runner / manager with the same server config but different
  // fetchConcurrency, it will not take any affect.
  const getUFGClientWithCache = utils.general.cachify(getUFGClient, ([options]) =>
    client ? 'default' : [{...options.settings, fetchConcurrency: undefined}],
  )
  if (client) getUFGClientWithCache.setCachedValue('default', Promise.resolve(client))
  return getUFGClientWithCache

  async function getUFGClient({settings, logger = mainLogger}: {settings: UFGClientSettings; logger?: Logger}) {
    logger = logger.extend(mainLogger)

    const tunnelIds = utils.general.getEnvValue('FETCH_RESOURCE_FROM_TUNNEL', 'boolean')
      ? utils.general.getEnvValue('TUNNEL_IDS')
      : undefined

    return makeUFGClient({
      settings: {...settings, fetchConcurrency, tunnelIds, asyncCache},
      logger,
    })
  }
}
