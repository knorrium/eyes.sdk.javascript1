import type {CloseSettings, TestResult} from './types'
import type {Eyes} from './types'
import {type Logger} from '@applitools/logger'
import type {DriverTarget} from './types'
import {isDriver, makeDriver, type SpecDriver} from '@applitools/driver'

type Options<TDriver, TContext, TElement, TSelector> = {
  eyes: Eyes<TDriver, TContext, TElement, TSelector>
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger: Logger
}

export function makeClose<TDriver, TContext, TElement, TSelector>({
  eyes,
  target,
  spec,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function close({
    settings,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
    const testMetadata = await driver?.getSessionMetadata()
    const baseEyes = await eyes.getBaseEyes()
    return (
      await Promise.all(baseEyes.map(baseEyes => baseEyes.close({settings: {...settings, testMetadata}, logger})))
    ).flat()
  }
}
