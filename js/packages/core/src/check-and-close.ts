import type {Target, DriverTarget, Eyes, Config, CheckSettings, CloseSettings, TestResult} from './types'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'

type Options<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = {
  type?: TType
  eyes: Eyes<TSpec, TType>
  target?: DriverTarget<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeCheckAndClose<TSpec extends SpecType, TDefaultType extends 'classic' | 'ufg'>({
  type: defaultType = 'classic' as TDefaultType,
  eyes,
  target: defaultTarget,
  spec,
  logger: defaultLogger,
}: Options<TSpec, TDefaultType>) {
  return async function checkAndClose<TType extends 'classic' | 'ufg' = TDefaultType>({
    type = defaultType as unknown as TType,
    target = defaultTarget,
    settings = {},
    config,
    logger = defaultLogger,
  }: {
    type?: TType
    target?: Target<TSpec, TType>
    settings?: CheckSettings<TSpec, TDefaultType> &
      CloseSettings<TDefaultType> &
      CheckSettings<TSpec, TType> &
      CloseSettings<TType>
    config?: Config<TSpec, TDefaultType> & Config<TSpec, TType>
    logger?: Logger
  } = {}): Promise<TestResult<TType>[]> {
    settings = {...config?.screenshot, ...config?.check, ...config?.close, ...settings}

    const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
    const typedEyes = await eyes.getTypedEyes({
      type,
      settings: driver
        ? {
            type: driver.isNative ? 'native' : 'web',
            renderers: (settings as CheckSettings<TSpec, 'ufg'>).renderers!,
          }
        : undefined,
      logger,
    })
    const results = await typedEyes.checkAndClose({target: driver ?? target, settings, logger})
    return results as TestResult<TType>[]
  }
}
