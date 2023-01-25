import type {MaybeArray} from '@applitools/utils'
import type {Target, DriverTarget, Eyes, Config, ExtractTextSettings} from './types'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg'> = {
  eyes: Eyes<TDriver, TContext, TElement, TSelector, TType>
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  logger: Logger
}

export function makeExtractText<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg' = 'classic'>({
  eyes,
  target: defaultTarget,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector, TType>) {
  return async function extractText({
    target = defaultTarget,
    settings,
    config,
    logger = defaultLogger,
  }: {
    target?: Target<TDriver, TContext, TElement, TSelector, 'classic'>
    settings: MaybeArray<ExtractTextSettings<TElement, TSelector, 'classic'>>
    config?: Config<TElement, TSelector, 'classic'>
    logger?: Logger
  }): Promise<string[]> {
    if (utils.types.isArray(settings)) {
      settings = settings.map(settings => {
        settings = {...config?.screenshot, ...settings}
        settings.autProxy ??= eyes.test.server.proxy
        return settings
      })
    } else {
      settings = {...config?.screenshot, ...settings}
      settings.autProxy ??= eyes.test.server.proxy
    }
    const classicEyes = await eyes.getTypedEyes({type: 'classic', logger})
    const results = await classicEyes.extractText({target, settings, logger})
    return results
  }
}
