import type {CloseSettings} from './types'
import type {Eyes} from './types'
import {type Logger} from '@applitools/logger'
import type {DriverTarget} from './types'
import {isDriver, makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'

type Options<TSpec extends SpecType> = {
  eyes: Eyes<TSpec>
  target?: DriverTarget<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeClose<TSpec extends SpecType>({eyes, target, spec, logger: mainLogger}: Options<TSpec>) {
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

    const baseEyes = await eyes.getBaseEyes()
    await Promise.all(baseEyes.map(baseEyes => baseEyes.close({settings, logger})))
  }
}
