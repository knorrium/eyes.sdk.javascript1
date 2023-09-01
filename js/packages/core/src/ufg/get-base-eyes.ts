import type {Eyes, GetBaseEyesSettings, OpenSettings} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type SpecType} from '@applitools/driver'
import {type Renderer as UFGRenderer} from '@applitools/ufg-client'
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
  logger: mainLogger,
}: Options<TSpec>) {
  const getBaseEyesWithCache = utils.general.wrap(getBaseEyes, (getBaseEyes, options) => {
    const key = JSON.stringify(options.settings.renderer)
    let item = eyes.storage.get(key)
    if (!item) {
      item = {eyes: utils.promises.makeControlledPromise(), jobs: []}
      eyes.storage.set(key, item)
    }
    if (!item.eyes.settled) item.eyes.resolve(getBaseEyes(options))
    return item.eyes
  })

  return getBaseEyesWithCache

  async function getBaseEyes({
    settings,
    logger = mainLogger,
  }: {
    settings: GetBaseEyesSettings
    logger?: Logger
  }): Promise<BaseEyes> {
    logger = logger.extend(mainLogger)

    logger.log(`Command "getBaseEyes" is called with settings`, settings)

    const ufgClient = await eyes.core.getUFGClient({
      settings: {
        ...eyes.test.ufgServer,
        eyesServerUrl: eyes.test.eyesServer.eyesServerUrl,
        apiKey: eyes.test.eyesServer.apiKey,
      },
      logger,
    })
    const environment = await ufgClient.getRenderEnvironment({
      settings: {renderer: settings.renderer as UFGRenderer},
      logger,
    })

    return eyes.core.base.openEyes({
      settings: {
        ...defaultSettings,
        environment: {...defaultSettings.environment, ...environment, properties: settings.renderer.properties},
      },
      logger,
    })
  }
}
