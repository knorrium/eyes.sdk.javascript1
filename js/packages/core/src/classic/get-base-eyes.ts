import type {Eyes, OpenSettings} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type SpecType} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  settings: OpenSettings
  eyes: Eyes<TSpec>
  base?: BaseEyes[]
  logger: Logger
}

export function makeGetBaseEyes<TSpec extends SpecType>({settings, eyes, base, logger: mainLogger}: Options<TSpec>) {
  const getBaseEyesWithCache = utils.general.cachify(getBaseEyes, () => 'default')
  if (base) getBaseEyesWithCache.setCachedValue('default', Promise.resolve(base))
  return getBaseEyesWithCache

  async function getBaseEyes({logger = mainLogger}: {logger?: Logger} = {}): Promise<BaseEyes[]> {
    logger = logger.extend(mainLogger)

    logger.log(`Command "getBaseEyes" is called with settings`, settings)
    const baseEyes = await eyes.core.base.openEyes({settings, logger})
    return [baseEyes]
  }
}
