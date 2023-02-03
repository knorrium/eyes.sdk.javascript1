import type {ClassicTarget, DriverTarget, ImageTarget, Eyes, LocateTextSettings, LocateTextResult} from './types'
import type {LocateTextSettings as BaseLocateTextSettings} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from '../automation/utils/take-screenshot'
// import {takeDomCapture} from './utils/take-dom-capture'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  eyes: Eyes<TDriver, TContext, TElement, TSelector>
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger: Logger
}

export function makeLocateText<TDriver, TContext, TElement, TSelector>({
  eyes,
  target: defaultTarget,
  spec,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function locateText<TPattern extends string>({
    target = defaultTarget,
    settings,
    logger = defaultLogger,
  }: {
    target?: ClassicTarget<TDriver, TContext, TElement, TSelector>
    settings: LocateTextSettings<TPattern, TElement, TSelector>
    logger?: Logger
  }): Promise<LocateTextResult<TPattern>> {
    logger.log('Command "locateText" is called with settings', settings)
    if (!target) throw new Error('Method was called with no target')
    const [baseEyes] = await eyes.getBaseEyes()
    if (!isDriver(target, spec)) {
      return baseEyes.locateText({target, settings: settings as BaseLocateTextSettings<TPattern>, logger})
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
    const results = await baseEyes.locateText({
      target: baseTarget,
      settings: settings as BaseLocateTextSettings<TPattern>,
      logger,
    })
    return results
  }
}
