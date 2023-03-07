import {type SpecType, type Driver} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {makeNMLClient, type NMLClient, type NMLRequestsConfig} from '@applitools/nml-client'
import * as utils from '@applitools/utils'

type Options = {
  config: Omit<NMLRequestsConfig, 'brokerUrl'>
  client?: NMLClient
  logger: Logger
}

export function makeGetNMLClient({config, client, logger: defaultLogger}: Options) {
  const getBaseEyesWithCache = utils.general.cachify(getNMLClient, () => 'default')
  if (client) getBaseEyesWithCache.setCachedValue('default', Promise.resolve(client))
  return getBaseEyesWithCache

  async function getNMLClient({driver, logger = defaultLogger}: {driver: Driver<SpecType>; logger?: Logger}) {
    const brokerUrl = await driver.extractBrokerUrl()
    if (!brokerUrl) return null
    return makeNMLClient({config: {brokerUrl, ...config}, logger})
  }
}
