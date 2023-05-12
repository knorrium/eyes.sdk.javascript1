import type {Region} from '@applitools/utils'
import type {Target, ImageTarget, Core, LocateSettings, LocateResult} from './types'
import type {LocateSettings as BaseLocateSettings} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from './utils/take-screenshot'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  core: Core<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeLocate<TSpec extends SpecType>({spec, core, logger: mainLogger}: Options<TSpec>) {
  return async function locate<TLocator extends string>({
    settings,
    target,
    logger = mainLogger,
  }: {
    target: Target<TSpec>
    settings: LocateSettings<TLocator, TSpec>
    logger?: Logger
  }): Promise<LocateResult<TLocator>> {
    logger = logger.extend(mainLogger)

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

    const environment = await driver.getEnvironment()
    const viewport = await driver.getViewport()
    return Object.entries<Region[]>(results).reduce((results, [key, regions]) => {
      results[key as TLocator] = regions.map(region => {
        region = utils.geometry.offset(region, viewport.viewportLocation ?? {x: 0, y: 0})
        region = utils.geometry.scale(region, 1 / viewport.viewportScale)
        if (environment.isNative && environment.isAndroid) region = utils.geometry.scale(region, viewport.pixelRatio)
        return region
      })
      return results
    }, {} as LocateResult<TLocator>)
  }
}
