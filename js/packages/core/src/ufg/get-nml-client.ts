import {type SpecType, type Driver} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {makeNMLClient, type NMLClient, type NMLRequestsConfig} from '@applitools/nml-client'
import * as utils from '@applitools/utils'

type Options = {
  client?: NMLClient
  logger: Logger
}

export function makeGetNMLClient({client, logger: mainLogger}: Options) {
  const getNMLClientWithCache = utils.general.cachify(getNMLClient, ([options]) =>
    client ? 'default' : [options.driver.guid, options.config],
  )
  if (client) getNMLClientWithCache.setCachedValue('default', Promise.resolve(client))
  return getNMLClientWithCache

  async function getNMLClient({
    driver,
    config,
    logger = mainLogger,
  }: {
    driver: Driver<SpecType>
    config: Omit<NMLRequestsConfig, 'brokerUrl'>
    logger?: Logger
  }) {
    logger = logger.extend(mainLogger)

    const brokerUrl = await driver.extractBrokerUrl()
    if (!brokerUrl) return null
    return makeNMLClient({config: {brokerUrl, ...config}, logger})
  }
}
