import {type SpecType, type Driver} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {makeNMLClient, type NMLClient, type NMLClientSettings} from '@applitools/nml-client'
import * as utils from '@applitools/utils'

type Options = {
  client?: NMLClient
  logger: Logger
}

export function makeGetNMLClient({client, logger: mainLogger}: Options) {
  const getNMLClientWithCache = utils.general.cachify(getNMLClient, ([options]) =>
    client ? 'default' : [options.driver.guid, options.settings],
  )
  if (client) getNMLClientWithCache.setCachedValue('default', Promise.resolve(client))
  return getNMLClientWithCache

  async function getNMLClient({
    driver,
    settings,
    logger = mainLogger,
  }: {
    driver: Driver<SpecType>
    settings: Omit<NMLClientSettings, 'brokerUrl'>
    logger?: Logger
  }) {
    logger = logger.extend(mainLogger)

    const brokerUrl = await driver.extractBrokerUrl()
    if (!brokerUrl) throw new Error('Unable to extract broker url from the device')
    return makeNMLClient({settings: {brokerUrl, ...settings}, logger})
  }
}
