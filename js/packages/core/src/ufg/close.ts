import type {DriverTarget, CloseSettings} from './types'
import {type Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {isDriver, makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {Renderer} from '@applitools/ufg-client'

type Options<TSpec extends SpecType> = {
  storage: Map<string, Promise<{renderer: Renderer; eyes: BaseEyes}>[]>
  target?: DriverTarget<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeClose<TSpec extends SpecType>({storage, target, spec, logger: mainLogger}: Options<TSpec>) {
  return async function close({
    settings,
    logger = mainLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger)

    logger.log('Command "close" is called with settings', settings)
    settings ??= {}
    if (!settings.testMetadata) {
      try {
        const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
        settings.testMetadata = await driver?.getSessionMetadata()
      } catch (error: any) {
        logger.warn('Command "close" received an error during extracting driver metadata', error)
      }
    }

    storage.forEach(async promises => {
      try {
        const [{eyes}] = await Promise.all(promises)
        try {
          await eyes.close({settings, logger})
        } catch (error) {
          logger.warn('Command "close" received an error during performing, trying to perform abort instead', error)
          await eyes.abort({settings, logger})
        }
      } catch (error: any) {
        logger.warn('Command "close" received an error during waiting for eyes instances in background', error)
        await error.info?.eyes?.abort({settings, logger})
      }
    })
  }
}
