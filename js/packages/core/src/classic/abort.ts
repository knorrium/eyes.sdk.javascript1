import type {AbortSettings} from './types'
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

export function makeAbort<TSpec extends SpecType>({eyes, target, spec, logger: mainLogger}: Options<TSpec>) {
  return async function abort({
    settings,
    logger = mainLogger,
  }: {
    settings?: AbortSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger)

    logger.log('Command "abort" is called with settings', settings)
    settings ??= {}
    if (!settings.testMetadata && isDriver(target, spec)) {
      try {
        const driver = await makeDriver({spec, driver: target, relaxed: true, logger})
        settings.testMetadata = await driver.getSessionMetadata()
      } catch (error: any) {
        logger.warn('Command "abort" received an error during extracting driver metadata', error)
      }
    }
    const baseEyes = await eyes.getBaseEyes()
    await Promise.all(baseEyes.map(baseEyes => baseEyes.abort({settings, logger})))
  }
}
