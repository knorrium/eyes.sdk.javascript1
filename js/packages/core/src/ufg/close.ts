import type {DriverTarget, CloseSettings, CheckResult} from './types'
import {type Logger} from '@applitools/logger'
import {isDriver, makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'

type Options<TSpec extends SpecType> = {
  storage: Map<string, CheckResult['promise'][]>
  target?: DriverTarget<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeClose<TSpec extends SpecType>({storage, target, spec, logger: defaultLogger}: Options<TSpec>) {
  return async function close({
    settings,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger.log('Command "close" is called with settings', settings)
    const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
    const testMetadata = await driver?.getSessionMetadata()

    storage.forEach(async promises => {
      try {
        const [{eyes}] = await Promise.all(promises)
        try {
          await eyes.close({settings: {...settings, testMetadata}, logger})
        } catch (error) {
          logger.warn('Command "close" received an error during performing, trying to perform abort instead', error)
          await eyes.abort({settings: {...settings, testMetadata}, logger})
        }
      } catch (error: any) {
        logger.warn('Command "close" received an error during waiting for eyes instances in background', error)
        await error.info?.eyes?.abort({settings: {...settings, testMetadata}, logger})
      }
    })
  }
}
