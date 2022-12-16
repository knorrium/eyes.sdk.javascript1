import type {Target, Eyes, Config, LocateTextSettings, LocateTextResult} from './types'
import {type Logger} from '@applitools/logger'

type Options<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg'> = {
  eyes: Eyes<TDriver, TContext, TElement, TSelector, TType>
  logger: Logger
}

export function makeLocateText<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg' = 'classic'>({
  eyes,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector, TType>) {
  return async function locateText<TPattern extends string>({
    target,
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
    const results = await classicEyes.locateText({target: target as any, settings, logger})
    return results
  }
}
