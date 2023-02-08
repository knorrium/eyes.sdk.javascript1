import type {DriverTarget, TypedCore, TypedEyes, OpenSettings} from './types'
import {type SpecType} from '@applitools/driver'
import {type Renderer} from '@applitools/ufg-client'
import {type Logger} from '@applitools/logger'

type Options<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = {
  type: TType
  settings: OpenSettings<TType>
  target?: DriverTarget<TSpec>
  cores: {[TKey in 'classic' | 'ufg']: TypedCore<TSpec, TKey>}
  logger?: Logger
}

export function makeGetTypedEyes<TSpec extends SpecType, TDefaultType extends 'classic' | 'ufg'>({
  type: defaultType,
  settings: defaultSettings,
  target,
  cores,
  logger: defaultLogger,
}: Options<TSpec, TDefaultType>) {
  let eyes: TypedEyes<TSpec, 'classic' | 'ufg'>
  return async function getTypesEyes<TType extends 'classic' | 'ufg' = TDefaultType>({
    type = defaultType as unknown as TType,
    settings,
    logger = defaultLogger,
  }: {
    type?: TType
    settings?: {type: 'web' | 'native'; renderers: Renderer[]}
    logger?: Logger
  } = {}): Promise<TypedEyes<TSpec, TType>> {
    if (!eyes) {
      eyes = await cores[type].openEyes({target, settings: defaultSettings, logger})
      return eyes as TypedEyes<TSpec, TType>
    } else if (eyes.type === type) {
      return eyes as TypedEyes<TSpec, TType>
    } else if (type === 'ufg') {
      const baseEyes = await eyes.getBaseEyes()
      const typedEyes = await cores.ufg.openEyes({target, settings: defaultSettings, eyes: baseEyes, logger})
      return typedEyes as TypedEyes<TSpec, TType>
    } else {
      const baseEyes = (
        await Promise.all(
          settings!.renderers.map(renderer => eyes.getBaseEyes({settings: {type: settings!.type, renderer}})),
        )
      ).flat()
      const typedEyes = await cores.classic.openEyes({target, settings: defaultSettings, eyes: baseEyes, logger})
      return typedEyes as TypedEyes<TSpec, TType>
    }
  }
}
