import type {Eyes, GetBaseEyesSettings, OpenSettings, Environment} from './types'
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

export function makeGetBaseEyes<TSpec extends SpecType>({
  settings: defaultSettings,
  eyes,
  base,
  logger: mainLogger,
}: Options<TSpec>) {
  const getBaseEyesWithCache = utils.general.cachify(getBaseEyes, ([options]) => options?.settings?.renderer)
  if (base) {
    base.forEach(baseEyes => getBaseEyesWithCache.setCachedValue(baseEyes.test.renderer, Promise.resolve([baseEyes])))
  }
  return getBaseEyesWithCache

  async function getBaseEyes({
    settings,
    logger = mainLogger,
  }: {
    settings?: GetBaseEyesSettings
    logger?: Logger
  } = {}): Promise<BaseEyes[]> {
    logger = logger.extend(mainLogger)

    logger.log(`Command "getBaseEyes" is called with settings`, settings)
    if (!settings) throw new Error('')
    const ufgClient = await eyes.core.getUFGClient({
      settings: {
        ...eyes.test.ufgServer,
        eyesServerUrl: eyes.test.eyesServer.eyesServerUrl,
        apiKey: eyes.test.eyesServer.apiKey,
      },
      logger,
    })
    const environment: Environment = await ufgClient.getRenderEnvironment({settings, logger})
    environment.properties = settings.properties
    const baseEyes = await eyes.core.base.openEyes({
      settings: {...defaultSettings, environment: {...defaultSettings.environment, ...environment}},
      logger,
    })
    return [baseEyes]
  }
}
