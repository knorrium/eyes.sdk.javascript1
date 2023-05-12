import type {Target, ImageTarget, Core, LocateTextSettings, LocateTextResult} from './types'
import type {LocateTextSettings as BaseLocateTextSettings} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from './utils/take-screenshot'
// import {takeDomCapture} from './utils/take-dom-capture'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  core: Core<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeLocateText<TSpec extends SpecType>({core, spec, logger: mainLogger}: Options<TSpec>) {
  return async function locateText<TPattern extends string>({
    target,
    settings,
    logger = mainLogger,
  }: {
    target: Target<TSpec>
    settings: LocateTextSettings<TPattern, TSpec>
    logger?: Logger
  }): Promise<LocateTextResult<TPattern>> {
    logger = logger.extend(mainLogger)

    logger.log('Command "locateText" is called with settings', settings)
    if (!isDriver(target, spec)) {
      return core.base.locateText({target, settings: settings as BaseLocateTextSettings<TPattern>, logger})
    }
    const driver = await makeDriver({spec, driver: target, logger})
    const environment = await driver.getEnvironment()
    const screenshot = await takeScreenshot({driver, settings, logger})
    const baseTarget: ImageTarget = {
      image: await screenshot.image.toPng(),
      locationInViewport: utils.geometry.location(screenshot.region),
    }
    if (environment.isWeb) {
      // if (settings.fully) await screenshot.scrollingElement.setAttribute('data-applitools-scroll', 'true')
      // else await screenshot.element?.setAttribute('data-applitools-scroll', 'true')
      // baseTarget.dom = await takeDomCapture({driver, settings: {proxy: settings.proxy}, logger}).catch(() => null)
    }
    const results = await core.base.locateText({
      target: baseTarget,
      settings: settings as BaseLocateTextSettings<TPattern>,
      logger,
    })
    return results
  }
}
