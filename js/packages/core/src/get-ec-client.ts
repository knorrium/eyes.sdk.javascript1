import {makeECClient, type ECClient, type ECClientSettings} from '@applitools/ec-client'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  logger: Logger
}

export function makeGetECClient({logger: defaultLogger}: Options) {
  return utils.general.cachify(getECClient, ([options]) => [options?.settings])
  async function getECClient({
    settings,
    logger = defaultLogger,
  }: {settings?: Partial<ECClientSettings>; logger?: Logger} = {}): Promise<ECClient> {
    const client = await makeECClient({settings, logger})
    return client
  }
}
