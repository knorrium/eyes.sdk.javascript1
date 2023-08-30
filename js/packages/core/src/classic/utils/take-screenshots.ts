import type {ScreenshotSettings, Renderer} from '../types'
import type {Target as BaseTarget} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {type SpecType, type Driver, type ElementReference} from '@applitools/driver'
import {takeDomCapture, type DomCaptureSettings} from './take-dom-capture'
import {takeScreenshot} from '../../automation/utils/take-screenshot'
import * as utils from '@applitools/utils'

export type ScreenshotsSettings<TSpec extends SpecType> = ScreenshotSettings<TSpec> & {
  renderers: Renderer[]
  regionsToCalculate?: ElementReference<TSpec>[]
  calculateView?: boolean
  domSettings?: DomCaptureSettings
}

export async function takeScreenshots<TSpec extends SpecType>({
  driver,
  settings,
  logger,
}: {
  driver: Driver<TSpec>
  settings: ScreenshotsSettings<TSpec>
  logger: Logger
}): Promise<(BaseTarget & {calculatedRegions: any})[]> {
  const screenshot = await takeScreenshot({driver, settings, logger})
  const baseTarget: BaseTarget & {calculatedRegions: any} = {
    name: await driver.getTitle(),
    source: await driver.getUrl(),
    image: await screenshot.image.toPng(),
    locationInViewport: utils.geometry.location(screenshot.region),
    calculatedRegions: screenshot.calculatedRegions,
    isTransformed: true,
  }

  const environment = await driver.getEnvironment()

  if (environment.isWeb && settings.domSettings) {
    if (settings.fully) await screenshot.scrollingElement?.setAttribute('data-applitools-scroll', 'true')
    else await screenshot.element?.setAttribute('data-applitools-scroll', 'true')
    baseTarget.dom = await takeDomCapture({driver, settings: settings.domSettings, logger}).catch(() => undefined)
  }
  if (settings.calculateView) {
    const scrollingElement = await driver.mainContext.getScrollingElement()
    const scrollingOffset =
      !scrollingElement || environment.isNative ? {x: 0, y: 0} : await scrollingElement.getScrollOffset()
    baseTarget.locationInView = utils.geometry.offset(scrollingOffset, screenshot.region)
    baseTarget.fullViewSize = scrollingElement
      ? await scrollingElement.getContentSize()
      : await driver.getViewportSize()
  }
  await screenshot.restoreState()

  return new Array(settings.renderers.length).fill(baseTarget)
}
