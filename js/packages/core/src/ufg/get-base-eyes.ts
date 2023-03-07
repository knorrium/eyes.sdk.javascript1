import type {Eyes, OpenSettings} from './types'
import type {Core as BaseCore, Eyes as EyesBase} from '@applitools/core-base'
import {type SpecType} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {type Renderer} from '@applitools/ufg-client'
import * as utils from '@applitools/utils'

type Options = {
  eyes: Eyes<SpecType>
  settings: OpenSettings
  core: BaseCore
  baseEyes?: EyesBase[]
  logger: Logger
}

export function makeGetBaseEyes({eyes, settings: defaultSettings, core, baseEyes, logger: defaultLogger}: Options) {
  const getBaseEyesWithCache = utils.general.cachify(getBaseEyes, ([options]) => options?.settings)
  if (baseEyes) {
    baseEyes.forEach(baseEyes =>
      getBaseEyesWithCache.setCachedValue(baseEyes.test.rendererInfo, Promise.resolve([baseEyes])),
    )
  }
  return getBaseEyesWithCache

  async function getBaseEyes({
    settings,
    logger = defaultLogger,
  }: {
    settings?: {type: 'web' | 'native'; renderer: Renderer}
    logger?: Logger
  } = {}): Promise<EyesBase[]> {
    logger.log(`Command "getBaseEyes" is called with settings`, settings)
    if (!settings) throw new Error('')
    const ufgClient = await eyes.getUFGClient({logger})
    const environment = await ufgClient.bookRenderer({settings})
    const eyesBase = await core.openEyes({
      settings: {...defaultSettings, environment: {...defaultSettings.environment, ...environment}},
      logger,
    })
    return [eyesBase]
  }
}
