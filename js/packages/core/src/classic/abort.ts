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

export function makeAbort<TSpec extends SpecType>({eyes, target, spec, logger: defaultLogger}: Options<TSpec>) {
  return async function abort({
    settings,
    logger = defaultLogger,
  }: {
    settings?: AbortSettings
    logger?: Logger
  } = {}): Promise<void> {
    const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
    const testMetadata = await driver?.getSessionMetadata()
    const baseEyes = await eyes.getBaseEyes()
    await Promise.all(baseEyes.map(baseEyes => baseEyes.abort({settings: {...settings, testMetadata}, logger})))
  }
}
