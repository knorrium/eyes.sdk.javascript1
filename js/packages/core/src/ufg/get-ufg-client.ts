import {type Logger} from '@applitools/logger'
import {makeUFGClient, type UFGClient, type UFGRequestsConfig} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'

type Options = {
  config: UFGRequestsConfig
  concurrency: number
  client?: UFGClient
  logger: Logger
}

export function makeGetUFGClient({config, concurrency, client, logger: defaultLogger}: Options) {
  const getBaseEyesWithCache = utils.general.cachify(getUFGClient, () => 'default')
  if (client) getBaseEyesWithCache.setCachedValue('default', Promise.resolve(client))
  return getBaseEyesWithCache

  async function getUFGClient({logger = defaultLogger}: {logger?: Logger} = {}) {
    return makeUFGClient({config, concurrency, logger})
  }
}
