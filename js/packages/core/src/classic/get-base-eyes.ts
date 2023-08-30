import type {Eyes, GetBaseEyesSettings, OpenSettings, Environment} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type SpecType} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  settings: OpenSettings
  eyes: Eyes<TSpec>
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
      item = {renderer: options.settings.renderer, eyes: getBaseEyes(options), jobs: []}
      eyes.storage.set(key, item)
    } else if (!item.eyes) {
      item.eyes = getBaseEyes(options)
    }
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

    let environment: Environment | undefined
    if (utils.types.has(settings.renderer, 'environment')) {
      environment = settings.renderer.environment
    } else {
      // NOTE: ios and android handled by nml-client
      // TODO: chrome emulation, desktop
    }

    return eyes.core.base.openEyes({
      settings: {
        ...defaultSettings,
        environment: {...defaultSettings.environment, ...environment, properties: settings.renderer.properties},
      },
      logger,
    })
  }
}
