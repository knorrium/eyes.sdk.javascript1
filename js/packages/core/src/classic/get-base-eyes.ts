import type {OpenSettings} from './types'
import type {Core as BaseCore, Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options = {
  settings: OpenSettings
  core: BaseCore
  eyes?: BaseEyes[]
  logger: Logger
}

export function makeGetBaseEyes({settings, core, eyes, logger: defaultLogger}: Options) {
  const getBaseEyesWithCache = utils.general.cachify(getBaseEyes, () => 'default')
  if (eyes) getBaseEyesWithCache.setCachedValue('default', Promise.resolve(eyes))
  return getBaseEyesWithCache

  async function getBaseEyes({logger = defaultLogger}: {logger?: Logger} = {}): Promise<BaseEyes[]> {
    logger.log(`Command "getBaseEyes" is called with settings`, settings)
    const eyes = await core.openEyes({settings, logger})
    return [eyes]
  }
}
