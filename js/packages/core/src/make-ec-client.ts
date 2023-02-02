import type {Core as BaseCore} from '@applitools/core-base'
import {type ECClient, type ECClientSettings} from '@applitools/ec-client'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  core: BaseCore
  logger: Logger
}

export function makeMakeECClient({logger: defaultLogger}: Options) {
  return utils.general.cachify(makeECClient, ([options]) => options?.settings)
  async function makeECClient({
    settings,
    logger = defaultLogger,
  }: {settings?: ECClientSettings; logger?: Logger} = {}): Promise<ECClient> {
    const {makeECClient} = require('@applitools/ec-client')
    const client = await makeECClient({settings, logger})
    return client
  }
}
