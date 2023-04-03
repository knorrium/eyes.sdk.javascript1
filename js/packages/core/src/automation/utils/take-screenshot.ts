import type {Region} from '@applitools/utils'
import type {ScreenshotSettings} from '../../classic/types'
import {type Logger} from '@applitools/logger'
import {type Driver, type Element, type ElementReference, type SpecType} from '@applitools/driver'
import * as utils from '@applitools/utils'

const {takeScreenshot: legacyTakeScreenshot} = require('@applitools/screenshoter')

export type Screenshot<TSpec extends SpecType> = {
  image: any //TODO replace with a proper type
  region: Region
  element: Element<TSpec>
  scrollingElement: Element<TSpec>
  restoreState(): Promise<void>
  calculatedRegions: []
}

export async function takeScreenshot<TSpec extends SpecType>({
  driver,
  settings,
  logger,
}: {
  driver: Driver<TSpec>
  settings: ScreenshotSettings<TSpec> & {regionsToCalculate?: ElementReference<TSpec>[]}
  logger: Logger
}): Promise<Screenshot<TSpec>> {
  const environment = await driver.getEnvironment()
  return legacyTakeScreenshot({
    driver,
    frames: settings.frames?.map(frame => {
      return utils.types.isPlainObject(frame) && utils.types.has(frame, 'frame')
        ? {reference: frame.frame, scrollingElement: frame.scrollRootElement}
        : {reference: frame}
    }),
    webview: settings.webview,
    region: settings.region,
    fully: settings.fully,
    hideScrollbars: settings.hideScrollbars,
    hideCaret: settings.hideCaret,
    scrollingMode: settings.stitchMode?.toLowerCase(),
    overlap: settings.overlap,
    wait: settings.waitBeforeCapture,
    framed: environment.isNative,
    lazyLoad: settings.lazyLoad,
    stabilization: settings.normalization && {
      crop: settings.normalization.cut,
      scale: settings.normalization.scaleRatio,
      rotation: settings.normalization.rotation,
    },
    debug: settings.debugImages,
    logger,
    regionsToCalculate: settings.regionsToCalculate,
  })
}
