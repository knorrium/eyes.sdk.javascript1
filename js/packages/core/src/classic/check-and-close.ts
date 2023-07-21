import type {Target, DriverTarget, Eyes, CheckSettings, CloseSettings} from './types'
import type {
  Target as BaseTarget,
  CheckSettings as BaseCheckSettings,
  CloseSettings as BaseCloseSettings,
} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from '../automation/utils/take-screenshot'
import {takeDomCapture} from './utils/take-dom-capture'
import {toBaseCheckSettings} from '../automation/utils/to-base-check-settings'
import {waitForLazyLoad} from '../automation/utils/wait-for-lazy-load'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  eyes: Eyes<TSpec>
  target?: DriverTarget<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeCheckAndClose<TSpec extends SpecType>({
  eyes,
  target: defaultTarget,
  spec,
  logger: mainLogger,
}: Options<TSpec>) {
  return async function checkAndClose({
    target = defaultTarget,
    settings = {},
    logger = mainLogger,
  }: {
    target?: Target<TSpec>
    settings?: CheckSettings<TSpec> & CloseSettings
    logger?: Logger
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger)

    logger.log('Command "checkAndClose" is called with settings', settings)
    if (!target) throw new Error('Method was called with no target')
    const baseEyes = await eyes.getBaseEyes({logger})
    if (!isDriver(target, spec)) {
      const baseSettings = settings as BaseCheckSettings & BaseCloseSettings
      await Promise.all(baseEyes.map(baseEyes => baseEyes.checkAndClose({target, settings: baseSettings, logger})))
      return
    }
    const driver = await makeDriver({spec, driver: target, reset: target === defaultTarget, logger})
    const environment = await driver.getEnvironment()
    if (settings.lazyLoad && environment.isWeb) {
      await waitForLazyLoad({
        context: driver.currentContext,
        settings: settings.lazyLoad !== true ? settings.lazyLoad : {},
        logger,
      })
    }
    let baseTarget: BaseTarget
    let baseSettings: BaseCheckSettings
    const {elementReferencesToCalculate, getBaseCheckSettings} = toBaseCheckSettings({settings})
    if (
      environment.isWeb ||
      !environment.isApplitoolsLib ||
      settings.webview ||
      settings.screenshotMode === 'default'
    ) {
      const screenshot = await takeScreenshot({
        driver,
        settings: {...settings, regionsToCalculate: elementReferencesToCalculate},
        logger,
      })
      baseTarget = {
        name: await driver.getTitle(),
        source: await driver.getUrl(),
        image: await screenshot.image.toPng(),
        locationInViewport: utils.geometry.location(screenshot.region),
        isTransformed: true,
      }
      baseSettings = getBaseCheckSettings({calculatedRegions: screenshot.calculatedRegions})
      if (environment.isWeb && settings.sendDom) {
        if (settings.fully) await screenshot.scrollingElement?.setAttribute('data-applitools-scroll', 'true')
        else await screenshot.element?.setAttribute('data-applitools-scroll', 'true')
        baseTarget.dom = await takeDomCapture({driver, settings: {proxy: eyes.test.eyesServer.proxy}, logger}).catch(
          () => undefined,
        )
      }
      if (settings.pageId) {
        const scrollingElement = await driver.mainContext.getScrollingElement()
        const scrollingOffset =
          !scrollingElement || environment.isNative ? {x: 0, y: 0} : await scrollingElement.getScrollOffset()
        baseTarget.locationInView = utils.geometry.offset(scrollingOffset, screenshot.region)
        baseTarget.fullViewSize = scrollingElement
          ? await scrollingElement.getContentSize()
          : await driver.getViewportSize()
      }
      await screenshot.restoreState()
    } else {
      const nmlClient = await eyes.core.getNMLClient({config: eyes.test.eyesServer, driver, logger})
      const screenshot = await nmlClient.takeScreenshot({
        settings: {name: settings.name, waitBeforeCapture: settings.waitBeforeCapture, fully: settings.fully},
        logger,
      })
      baseTarget = {image: screenshot.image, isTransformed: true}
      baseSettings = getBaseCheckSettings({calculatedRegions: []})
    }
    await Promise.all(
      baseEyes.map(baseEyes => baseEyes.checkAndClose({target: baseTarget, settings: baseSettings, logger})),
    )
  }
}
