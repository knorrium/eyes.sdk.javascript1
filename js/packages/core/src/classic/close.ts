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

export function makeClose<TSpec extends SpecType>({eyes, target, spec, logger: defaultLogger}: Options<TSpec>) {
  return async function close({
    settings,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<void> {
    const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
    const testMetadata = await driver?.getSessionMetadata()
    const baseEyes = await eyes.getBaseEyes()
    await Promise.all(baseEyes.map(baseEyes => baseEyes.close({settings: {...settings, testMetadata}, logger})))
  }
}
