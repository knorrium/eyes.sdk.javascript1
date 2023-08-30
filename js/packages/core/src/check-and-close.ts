import type {Target, DriverTarget, Eyes, Config, CheckSettings, CloseSettings} from './types'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import * as utils from '@applitools/utils'

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
  logger: mainLogger,
}: Options<TSpec, TDefaultType>) {
  return async function checkAndClose<TType extends 'classic' | 'ufg' = TDefaultType>({
    type = defaultType as unknown as TType,
    target = defaultTarget,
    settings = {},
    config,
    logger = mainLogger,
  }: {
    type?: TType
    target?: Target<TSpec, TType>
    settings?: CheckSettings<TSpec, TDefaultType> &
      CloseSettings<TDefaultType> &
      CheckSettings<TSpec, TType> &
      CloseSettings<TType>
    config?: Config<TSpec, TDefaultType> & Config<TSpec, TType>
    logger?: Logger
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`check-and-close-${type}-${utils.general.shortid()}`]})

    settings = {...config?.screenshot, ...config?.check, ...config?.close, ...settings}

    const driver = isDriver(target, spec)
      ? await makeDriver({spec, driver: target, reset: target === defaultTarget, logger})
      : null
    const typedEyes = await eyes.getTypedEyes({type, logger})
    await typedEyes.checkAndClose({target: driver ?? target, settings, logger})
  }
}
