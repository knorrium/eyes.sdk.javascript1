import type {DriverTarget, TypedCore, TypedEyes, OpenSettings} from './types'
import {type Renderer} from '@applitools/ufg-client'
import {type Logger} from '@applitools/logger'

type Options<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg'> = {
  type: TType
  settings: OpenSettings<TType>
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  cores: {[TKey in 'classic' | 'ufg']: TypedCore<TDriver, TContext, TElement, TSelector, TKey>}
  logger?: Logger
}

export function makeGetTypedEyes<TDriver, TContext, TElement, TSelector, TDefaultType extends 'classic' | 'ufg'>({
  type: defaultType,
  settings: defaultSettings,
  target,
  cores,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector, TDefaultType>) {
  let eyes: TypedEyes<TDriver, TContext, TElement, TSelector, 'classic' | 'ufg'>
  return async function getTypesEyes<TType extends 'classic' | 'ufg' = TDefaultType>({
    type = defaultType as any,
    settings,
    logger = defaultLogger,
  }: {
    type?: TType
    settings?: {type: 'web' | 'native'; renderers: Renderer[]}
    logger?: Logger
  } = {}): Promise<TypedEyes<TDriver, TContext, TElement, TSelector, TType>> {
    if (!eyes) {
      eyes =
        type === 'ufg'
          ? await cores.ufg.openEyes({target, settings: defaultSettings, logger})
          : await cores.classic.openEyes({target, settings: defaultSettings, logger})
      return eyes as any
    } else if (eyes.type === type) {
      return eyes as any
    } else if (type === 'ufg') {
      const baseEyes = await eyes.getBaseEyes()
      return cores.ufg.openEyes({target, settings: defaultSettings, eyes: baseEyes, logger}) as any
    } else {
      const baseEyes = (
        await Promise.all(settings.renderers.map(renderer => eyes.getBaseEyes({settings: {type: settings.type, renderer}})))
      ).flat()
      return cores.classic.openEyes({target, settings: defaultSettings, eyes: baseEyes, logger}) as any
    }
  }
}
