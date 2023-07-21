import type {Target, DriverTarget, Eyes, CheckSettings, CheckResult} from './types'
import type {Target as BaseTarget, CheckSettings as BaseCheckSettings} from '@applitools/core-base'
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

export function makeCheck<TSpec extends SpecType>({
  eyes,
  target: defaultTarget,
  spec,
  logger: mainLogger,
}: Options<TSpec>) {
  return async function check({
    target = defaultTarget,
    settings = {},
    logger = mainLogger,
  }: {
    target?: Target<TSpec>
    settings?: CheckSettings<TSpec>
    logger?: Logger
  } = {}): Promise<CheckResult[]> {
    logger = logger.extend(mainLogger)

    logger.log('Command "check" is called with settings', settings)
    if (!target) throw new Error('Method was called with no target')
    const baseEyes = await eyes.getBaseEyes()
    if (!isDriver(target, spec)) {
      return (
        await Promise.all(
          baseEyes.map(baseEyes => baseEyes.check({target, settings: settings as BaseCheckSettings, logger})),
        )
      ).flat()
    }
    const driver = await makeDriver({spec, driver: target, reset: target === defaultTarget, logger})
    const environment = await driver.getEnvironment()
    await driver.currentContext.setScrollingElement(settings.scrollRootElement ?? null)
    if (settings.lazyLoad && environment.isWeb) {
      if (settings.lazyLoad) {
        await waitForLazyLoad({
          context: driver.currentContext,
          settings: settings.lazyLoad !== true ? settings.lazyLoad : {},
          logger,
        })
      }
    }
    // TODO it actually could be different per eyes
    const shouldRunOnce = true
    const finishAt = Date.now() + (settings.retryTimeout ?? 0)
    let baseTarget: BaseTarget
    let baseSettings: BaseCheckSettings
    let results: CheckResult[]
    const {elementReferencesToCalculate, getBaseCheckSettings} = toBaseCheckSettings({settings})
    do {
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
      baseSettings.ignoreMismatch = !shouldRunOnce
      results = (
        await Promise.all(
          baseEyes.map(baseEyes => baseEyes.check({target: baseTarget, settings: baseSettings, logger})),
        )
      ).flat()
    } while (!shouldRunOnce && !results.some(result => result.asExpected) && Date.now() < finishAt)
    if (!shouldRunOnce && !results.some(result => result.asExpected)) {
      baseSettings.ignoreMismatch = false
      results = (
        await Promise.all(
          baseEyes.map(baseEyes => baseEyes.check({target: baseTarget, settings: baseSettings, logger})),
        )
      ).flat()
    }
    return results
  }
}
