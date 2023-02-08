import type {DriverTarget, ImageTarget, LocateTextSettings, LocateTextResult} from './types'
import type {Core as BaseCore, LocateTextSettings as BaseLocateTextSettings} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from './utils/take-screenshot'
// import {takeDomCapture} from './utils/take-dom-capture'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  core: BaseCore
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeLocateText<TSpec extends SpecType>({core, spec, logger: defaultLogger}: Options<TSpec>) {
  return async function locateText<TPattern extends string>({
    target,
    settings,
    logger = defaultLogger,
  }: {
    target: DriverTarget<TSpec> | ImageTarget
    settings: LocateTextSettings<TPattern, TSpec>
    logger?: Logger
  }): Promise<LocateTextResult<TPattern>> {
    logger.log('Command "locateText" is called with settings', settings)
    if (!isDriver(target, spec)) {
      return core.locateText({target, settings: settings as BaseLocateTextSettings<TPattern>, logger})
    }
    const driver = await makeDriver({spec, driver: target, logger})
    const screenshot = await takeScreenshot({driver, settings, logger})
    const baseTarget: ImageTarget = {
      image: await screenshot.image.toPng(),
      locationInViewport: utils.geometry.location(screenshot.region),
    }
    if (driver.isWeb) {
      // if (settings.fully) await screenshot.scrollingElement.setAttribute('data-applitools-scroll', 'true')
      // else await screenshot.element?.setAttribute('data-applitools-scroll', 'true')
      // baseTarget.dom = await takeDomCapture({driver, logger}).catch(() => null)
    }
    const results = await core.locateText({
      target: baseTarget,
      settings: settings as BaseLocateTextSettings<TPattern>,
      logger,
    })
    return results
  }
}
