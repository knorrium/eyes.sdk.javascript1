import type {DriverTarget, ImageTarget, LocateSettings, LocateResult} from './types'
import type {Core as BaseCore, LocateSettings as BaseLocateSettings} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from './utils/take-screenshot'

type Options<TDriver, TContext, TElement, TSelector> = {
  core: BaseCore
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger: Logger
}

export function makeLocate<TDriver, TContext, TElement, TSelector>({
  spec,
  core,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function locate<TLocator extends string>({
    settings,
    target,
    logger = defaultLogger,
  }: {
    target: DriverTarget<TDriver, TContext, TElement, TSelector> | ImageTarget
    settings: LocateSettings<TLocator, TElement, TSelector>
    logger?: Logger
  }): Promise<LocateResult<TLocator>> {
    logger.log(`Command "locate" is called with settings`, settings)
    if (!isDriver(target, spec)) {
      return core.locate({target, settings: settings as BaseLocateSettings<TLocator>, logger})
    }
    const driver = await makeDriver({driver: target, spec, logger})
    const screenshot = await takeScreenshot({driver, settings, logger})
    const baseTarget = {image: await screenshot.image.toPng()}
    const results = await core.locate({target: baseTarget, settings: settings as BaseLocateSettings<TLocator>, logger})
    return results
  }
}
