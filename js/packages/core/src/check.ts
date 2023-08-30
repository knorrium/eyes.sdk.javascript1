import type {Target, DriverTarget, Eyes, Config, CheckSettings} from './types'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import * as utils from '@applitools/utils'
import chalk from 'chalk'

type Options<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = {
  type?: TType
  eyes: Eyes<TSpec, TType>
  target?: DriverTarget<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeCheck<TSpec extends SpecType, TDefaultType extends 'classic' | 'ufg'>({
  type: defaultType = 'classic' as TDefaultType,
  eyes,
  target: defaultTarget,
  spec,
  logger: mainLogger,
}: Options<TSpec, TDefaultType>) {
  let stepIndex = 0
  return async function check<TType extends 'classic' | 'ufg' = TDefaultType>({
    type = defaultType as unknown as TType,
    target = defaultTarget,
    settings,
    config,
    logger = mainLogger,
  }: {
    type?: TType
    target?: Target<TSpec, TType>
    settings?: CheckSettings<TSpec, TType>
    config?: Config<TSpec, TType>
    logger?: Logger
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger, {tags: [`check-${type}-${utils.general.shortid()}`]})

    settings = {...config?.screenshot, ...config?.check, ...settings}
    settings.fully ??= !settings.region && (!settings.frames || settings.frames.length === 0)
    settings.waitBeforeCapture ??= 100
    settings.hideScrollbars ??= true
    settings.hideCaret ??= true
    settings.overlap = {top: 10, bottom: 50, ...settings?.overlap}
    settings.matchLevel ??= 'Strict'
    settings.ignoreCaret ??= true
    settings.sendDom ??=
      eyes.test.account.rcaEnabled || settings.matchLevel === 'Layout' || settings.enablePatterns || settings.useDom
    settings.autProxy ??= eyes.test.eyesServer.proxy
    settings.useDom ??= false
    ;(settings as CheckSettings<TSpec, 'classic'>).retryTimeout ??= 2000
    settings.lazyLoad = settings.lazyLoad === true ? {} : settings.lazyLoad
    if (settings.lazyLoad) {
      settings.lazyLoad.scrollLength ??= 300
      settings.lazyLoad.waitingTime ??= 2000
      settings.lazyLoad.maxAmountToScroll ??= 15000
    }
    settings.stepIndex = stepIndex++
    settings.waitBetweenStitches ??= utils.types.isObject(settings.lazyLoad) ? settings.lazyLoad.waitingTime : 100

    if (settings.matchLevel === 'Content') {
      logger.console.log(
        chalk.yellow(`The "Content" match level value has been deprecated, use "IgnoreColors" instead.`),
      )
    }

    const driver = isDriver(target, spec)
      ? await makeDriver({spec, driver: target, reset: target === defaultTarget, logger})
      : null
    const typedEyes = await eyes.getTypedEyes({type, logger})
    return typedEyes.check({target: driver ?? target, settings, logger})
  }
}
