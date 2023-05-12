import type {MaybeArray} from '@applitools/utils'
import type {Target, ImageTarget, Core, ExtractTextSettings} from '../classic/types'
import type {ExtractTextSettings as BaseExtractTextSettings} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, isElementReference, type SpecType, type SpecDriver} from '@applitools/driver'
import {takeScreenshot} from './utils/take-screenshot'
import {takeDomCapture} from '../classic/utils/take-dom-capture'
import * as utils from '@applitools/utils'

const {getText} = require('@applitools/snippets')

type Options<TSpec extends SpecType> = {
  core: Core<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeExtractText<TSpec extends SpecType>({core, spec, logger: mainLogger}: Options<TSpec>) {
  return async function extractText({
    target,
    settings,
    logger = mainLogger,
  }: {
    target: Target<TSpec>
    settings: MaybeArray<ExtractTextSettings<TSpec>>
    logger?: Logger
  }): Promise<string[]> {
    logger = logger.extend(mainLogger)

    logger.log('Command "extractText" is called with settings', settings)
    if (!isDriver(target, spec)) {
      return core.base.extractText({target, settings: settings as MaybeArray<BaseExtractTextSettings>, logger})
    }
    settings = utils.types.isArray(settings) ? settings : [settings]
    const driver = await makeDriver({spec, driver: target, logger})
    const environment = await driver.getEnvironment()
    const results = await settings.reduce(async (prev, settings) => {
      const steps = await prev
      const screenshot = await takeScreenshot({driver, settings, logger})
      if (!settings.hint && isElementReference(settings.region, spec)) {
        const element = await driver.currentContext.element(settings.region)
        if (!element) throw new Error(`Unable to find element using provided selector`)
        settings.hint = await driver.currentContext.execute(getText, [element])
        if (settings.hint) settings.hint = settings.hint.replace(/[.\\+]/g, '\\$&')
      }
      const baseTarget: ImageTarget = {
        image: await screenshot.image.toPng(),
        size: utils.geometry.size(screenshot.region),
        locationInViewport: utils.geometry.location(screenshot.region),
      }
      if (environment.isWeb) {
        if (settings.fully) await screenshot.scrollingElement.setAttribute('data-applitools-scroll', 'true')
        else await screenshot.element?.setAttribute('data-applitools-scroll', 'true')
        baseTarget.dom = await takeDomCapture({driver, settings: {proxy: settings.proxy}, logger}).catch(
          () => undefined,
        )
      }
      delete settings.region
      delete settings.normalization
      const results = await core.base.extractText({
        target: baseTarget,
        settings: settings as BaseExtractTextSettings,
        logger,
      })
      steps.push(results)
      return steps
    }, Promise.resolve([] as string[][]))
    return results.flat()
  }
}
