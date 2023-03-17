import {type Logger} from '@applitools/logger'
import {makeUFGClient, type UFGClient, type UFGRequestsConfig} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'

type Options = {
  client?: UFGClient
  logger: Logger
}

export function makeGetUFGClient({client, logger: defaultLogger}: Options) {
  const getUFGClientWithCache = utils.general.cachify(getUFGClient, ([options]) =>
    client ? 'default' : [options.config],
  )
  if (client) getUFGClientWithCache.setCachedValue('default', Promise.resolve(client))
  return getUFGClientWithCache

  async function getUFGClient({config, logger = defaultLogger}: {config: UFGRequestsConfig; logger?: Logger}) {
    return makeUFGClient({config, logger})
  }
}
