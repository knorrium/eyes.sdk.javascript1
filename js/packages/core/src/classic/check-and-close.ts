import type {Target, DriverTarget, Eyes, CheckSettings, CloseSettings, Renderer} from './types'
import type {
  Target as BaseTarget,
  CheckSettings as BaseCheckSettings,
  CloseSettings as BaseCloseSettings,
} from '@applitools/core-base'
import {type AbortSignal} from 'abort-controller'
import {type Renderer as NMLRenderer} from '@applitools/nml-client'
import {type Logger} from '@applitools/logger'
import {makeDriver, isDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {takeScreenshots} from './utils/take-screenshots'
import {toBaseCheckSettings} from '../automation/utils/to-base-check-settings'
import {waitForLazyLoad} from '../automation/utils/wait-for-lazy-load'
import {uniquifyRenderers} from '../automation/utils/uniquify-renderers'
import {extractRendererKey} from '../automation/utils/extract-renderer-key'
import {AbortError} from '../errors/abort-error'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  eyes: Eyes<TSpec>
  target?: DriverTarget<TSpec>
  renderers?: Renderer[]
  spec?: SpecDriver<TSpec>
  signal?: AbortSignal
  logger: Logger
}

export function makeCheckAndClose<TSpec extends SpecType>({
  eyes,
  target: defaultTarget,
  renderers: defaultRenderers = [],
  spec,
  signal,
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

    if (signal?.aborted) {
      logger.warn('Command "checkAndClose" was called after test was already aborted')
      throw new AbortError('Command "checkAndClose" was called after test was already aborted')
    }

    const uniqueRenderers = uniquifyRenderers(settings.renderers ?? defaultRenderers)

    const baseTargets = [] as BaseTarget[]
    const baseSettings = [] as (BaseCheckSettings & BaseCloseSettings)[]
    const transformedRenderers = [] as Renderer[]
    if (isDriver(target, spec)) {
      const driver = await makeDriver({spec, driver: target, reset: target === defaultTarget, logger})
      await driver.currentContext.setScrollingElement(settings.scrollRootElement ?? null)

      const environment = await driver.getEnvironment()
      uniqueRenderers.forEach(renderer => {
        if (utils.types.has(renderer, 'iosDeviceInfo')) {
          renderer.iosDeviceInfo.version ??= environment.platformVersion
        } else if (utils.types.has(renderer, 'androidDeviceInfo')) {
          renderer.androidDeviceInfo.version ??= environment.platformVersion
        }
        return renderer
      })

      if (settings.lazyLoad && environment.isWeb) {
        await waitForLazyLoad({
          context: driver.currentContext,
          settings: settings.lazyLoad !== true ? settings.lazyLoad : {},
          logger,
        })
      }

      const {elementReferencesToCalculate, getBaseCheckSettings} = toBaseCheckSettings({settings})
      if (environment.isWeb || !environment.isApplitoolsLib || settings.screenshotMode === 'default') {
        const screenshots = await takeScreenshots({
          driver,
          settings: {
            ...settings,
            renderers: uniqueRenderers,
            regionsToCalculate: elementReferencesToCalculate,
            calculateView: !!settings.pageId,
            domSettings: settings.sendDom ? {proxy: eyes.test.eyesServer.proxy} : undefined,
          },
          logger,
        })
        transformedRenderers.push(...uniqueRenderers)
        screenshots.forEach(({calculatedRegions, ...baseTarget}) => {
          baseTargets.push(baseTarget)
          baseSettings.push(getBaseCheckSettings({calculatedRegions}))
        })
      } else {
        const nmlClient = await eyes.core.getNMLClient({
          driver,
          settings: {...eyes.test.eyesServer, renderEnvironmentsUrl: eyes.test.renderEnvironmentsUrl},
          logger,
        })
        const screenshots = await nmlClient.takeScreenshots({
          settings: {
            renderers: uniqueRenderers as NMLRenderer[],
            fully: settings.fully,
            stitchMode: settings.stitchMode,
            hideScrollbars: settings.hideScrollbars,
            hideCaret: settings.hideScrollbars,
            overlap: settings.overlap,
            waitBeforeCapture: settings.waitBeforeCapture,
            waitBetweenStitches: settings.waitBetweenStitches,
            lazyLoad: settings.lazyLoad,
            name: settings.name,
          },
          logger,
        })
        screenshots.forEach(({calculatedRegions: _calculatedRegions, renderEnvironment, ...baseTarget}) => {
          transformedRenderers.push({environment: renderEnvironment})
          baseTargets.push({...baseTarget, isTransformed: true})
          baseSettings.push(getBaseCheckSettings({calculatedRegions: []}))
        })
      }
    } else {
      transformedRenderers.push(...uniqueRenderers)
      baseTargets.push(target)
      baseSettings.push(settings as BaseCheckSettings)
    }

    const promises = transformedRenderers.map(async (renderer, index) => {
      const rendererLogger = logger.extend({tags: [`renderer-${utils.general.shortid()}`]})

      try {
        if (signal?.aborted) {
          rendererLogger.warn('Command "checkAndClose" was aborted before checking')
          throw new AbortError('Command "checkAndClose" was aborted before checking')
        }

        const baseEyes = await eyes.getBaseEyes({settings: {renderer}, logger: rendererLogger})
        try {
          if (signal?.aborted) {
            rendererLogger.warn('Command "checkAndClose" was aborted before checking')
            throw new AbortError('Command "checkAndClose" was aborted before checking')
          } else if (!baseEyes.running) {
            rendererLogger.warn(
              `Check on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
            throw new AbortError(
              `Check on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
          }

          await baseEyes.checkAndClose({
            target: baseTargets[index],
            settings: baseSettings[index],
            logger: rendererLogger,
          })
        } catch (error: any) {
          rendererLogger.error(
            `Check on environment with id "${baseEyes.test.renderEnvironmentId}" failed due to an error`,
            error,
          )
          await baseEyes.abort({logger: rendererLogger})
          error.info = {eyes: baseEyes}
          throw error
        }
      } catch (error: any) {
        rendererLogger.error(`Check with id ${renderer.id} failed before checking started due to an error`, error)
        error.info = {...error.info, userTestId: eyes.test.userTestId, renderer}
        throw error
      }
    })

    transformedRenderers.forEach((renderer, index) => {
      const key = extractRendererKey(renderer)
      let item = eyes.storage.get(key)
      if (!item) {
        item = {eyes: utils.promises.makeControlledPromise(), jobs: []}
        eyes.storage.set(key, item)
      }
      item.jobs.push(promises[index])
    })
  }
}
