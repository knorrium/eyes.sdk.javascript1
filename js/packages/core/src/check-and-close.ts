import type {Target, DriverTarget, Eyes, Config, CheckSettings, CloseSettings, TestResult} from './types'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecDriver} from '@applitools/driver'

type Options<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg'> = {
  type?: TType
  eyes: Eyes<TDriver, TContext, TElement, TSelector, TType>
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger: Logger
}

export function makeCheckAndClose<TDriver, TContext, TElement, TSelector, TDefaultType extends 'classic' | 'ufg' = 'classic'>({
  type: defaultType,
  eyes,
  target: defaultTarget,
  spec,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector, TDefaultType>) {
  return async function checkAndClose<TType extends 'classic' | 'ufg' = TDefaultType>({
    type = defaultType as any,
    target = defaultTarget,
    settings = {},
    config,
    logger = defaultLogger,
  }: {
    type?: TType
    target?: Target<TDriver, TContext, TElement, TSelector, TType>
    settings?: CheckSettings<TElement, TSelector, TDefaultType> &
      CloseSettings<TDefaultType> &
      CheckSettings<TElement, TSelector, TType> &
      CloseSettings<TType>
    config?: Config<TElement, TSelector, TDefaultType> & Config<TElement, TSelector, TType>
    logger?: Logger
  } = {}): Promise<TestResult<TType>[]> {
    settings = {...config?.screenshot, ...config?.check, ...config?.close, ...settings}

    const driver = isDriver(target, spec) ? await makeDriver({spec, driver: target, logger}) : null
    const typedEyes = await eyes.getTypedEyes({
      type,
      settings: driver && {
        type: driver.isNative ? 'native' : 'web',
        renderers: (settings as CheckSettings<TElement, TSelector, 'ufg'>).renderers,
      },
      logger,
    })
    const results = await typedEyes.checkAndClose({target: driver ?? target, settings, logger})
    return results
  }
}
