import {type Logger} from '@applitools/logger'
import {makeUFGClient, type UFGClient, type UFGClientConfig} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'

type Options = {
  client?: UFGClient
  logger: Logger
  fetchConcurrency?: number
}

export function makeGetUFGClient({client, fetchConcurrency, logger: defaultLogger}: Options) {
  // we are caching by the server config, therefor if the user creates another Runner / manager with the same server config but different
  // fetchConcurrency, it will not take any affect.
  const getUFGClientWithCache = utils.general.cachify(getUFGClient, ([options]) =>
    client ? 'default' : [{...options.config, fetchConcurrency: undefined}],
  )
  if (client) getUFGClientWithCache.setCachedValue('default', Promise.resolve(client))
  return getUFGClientWithCache

  async function getUFGClient({config, logger = defaultLogger}: {config: UFGClientConfig; logger?: Logger}) {
    return makeUFGClient({config: {...config, fetchConcurrency}, logger})
  }
}
