import type {Target, ImageTarget, Core, LocateSettings, LocateResult} from './types'
import type {LocateSettings as BaseLocateSettings} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from './utils/take-screenshot'

type Options<TSpec extends SpecType> = {
  core: Core<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeLocate<TSpec extends SpecType>({spec, core, logger: defaultLogger}: Options<TSpec>) {
  return async function locate<TLocator extends string>({
    settings,
    target,
    logger = defaultLogger,
  }: {
    target: Target<TSpec>
    settings: LocateSettings<TLocator, TSpec>
    logger?: Logger
  }): Promise<LocateResult<TLocator>> {
    logger.log(`Command "locate" is called with settings`, settings)
    if (!isDriver(target, spec)) {
      return core.base.locate({target, settings: settings as BaseLocateSettings<TLocator>, logger})
    }
    const driver = await makeDriver({driver: target, spec, logger})
    const screenshot = await takeScreenshot({driver, settings, logger})
    const baseTarget: ImageTarget = {image: await screenshot.image.toPng()}
    const results = await core.base.locate({
      target: baseTarget,
      settings: settings as BaseLocateSettings<TLocator>,
      logger,
    })
    return results
  }
}
