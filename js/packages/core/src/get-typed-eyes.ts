import type {DriverTarget, TypedCore, TypedEyes, OpenSettings, Renderer} from './types'
import {type SpecType} from '@applitools/driver'
import {type Logger} from '@applitools/logger'

type Options<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = {
  type: TType
  settings: OpenSettings<TType>
  target?: DriverTarget<TSpec>
  cores: {[TKey in 'classic' | 'ufg']: TypedCore<TSpec, TKey>}
  logger: Logger
}

export function makeGetTypedEyes<TSpec extends SpecType, TDefaultType extends 'classic' | 'ufg'>({
  type: defaultType,
  settings: defaultSettings,
  target,
  cores,
  logger: mainLogger,
}: Options<TSpec, TDefaultType>) {
  let eyes: TypedEyes<TSpec, 'classic' | 'ufg'>
  return async function getTypedEyes<TType extends 'classic' | 'ufg' = TDefaultType>({
    type = defaultType as unknown as TType,
    logger = mainLogger,
  }: {
    type?: TType
    settings?: {renderers?: Renderer[]}
    logger?: Logger
  } = {}): Promise<TypedEyes<TSpec, TType>> {
    logger = logger.extend(mainLogger)

    if (!eyes) {
      eyes = await cores[type].openEyes({target, settings: defaultSettings, logger})
      return eyes as TypedEyes<TSpec, TType>
    } else if (eyes.type === type) {
      return eyes as TypedEyes<TSpec, TType>
    } else if (type === 'ufg') {
      const typedEyes = await cores.ufg.openEyes({target, settings: defaultSettings, storage: eyes.storage, logger})
      return typedEyes as TypedEyes<TSpec, TType>
    } else {
      const typedEyes = await cores.classic.openEyes({target, settings: defaultSettings, storage: eyes.storage, logger})
      return typedEyes as TypedEyes<TSpec, TType>
    }
  }
}
