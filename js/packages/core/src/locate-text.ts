import type {DriverTarget, Target, Eyes, Config, LocateTextSettings, LocateTextResult} from './types'
import {type Logger} from '@applitools/logger'

type Options<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg'> = {
  eyes: Eyes<TDriver, TContext, TElement, TSelector, TType>
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  logger: Logger
}

export function makeLocateText<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg' = 'classic'>({
  eyes,
  target: defaultTarget,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector, TType>) {
  return async function locateText<TPattern extends string>({
    target = defaultTarget,
    settings,
    config,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver, TContext, TElement, TSelector, 'classic'>
    settings: LocateTextSettings<TPattern, TElement, TSelector, 'classic'>
    config?: Config<TElement, TSelector, 'classic'>
    logger?: Logger
  }): Promise<LocateTextResult<TPattern>> {
    settings = {...config?.screenshot, ...settings}
    settings.autProxy ??= eyes.test.server.proxy
    const classicEyes = await eyes.getTypedEyes({type: 'classic', logger})
    const results = await classicEyes.locateText({target, settings, logger})
    return results
  }
}
