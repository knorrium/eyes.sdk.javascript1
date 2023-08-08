import type {Region} from '@applitools/utils'
import type {DriverTarget, Target, Eyes, CheckSettings, CheckResult} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type Renderer, type DomSnapshot, type AndroidSnapshot, type IOSSnapshot} from '@applitools/ufg-client'
import {type AbortSignal} from 'abort-controller'
import {type Logger} from '@applitools/logger'
import {
  makeDriver,
  isDriver,
  isSelector,
  type SpecType,
  type SpecDriver,
  type Selector,
  type Cookie,
} from '@applitools/driver'
import {takeDomSnapshots} from './utils/take-dom-snapshots'
import {waitForLazyLoad} from '../automation/utils/wait-for-lazy-load'
import {toBaseCheckSettings} from '../automation/utils/to-base-check-settings'
import {generateSafeSelectors} from './utils/generate-safe-selectors'
import {uniquifyRenderers} from './utils/uniquify-renderers'
import {AbortError} from '../errors/abort-error'
import * as utils from '@applitools/utils'
import chalk from 'chalk'

type Options<TSpec extends SpecType> = {
  eyes: Eyes<TSpec>
  storage: Map<string, Promise<{renderer: Renderer; eyes: BaseEyes}>[]>
  target?: DriverTarget<TSpec>
  spec?: SpecDriver<TSpec>
  signal?: AbortSignal
  logger: Logger
}

export function makeCheck<TSpec extends SpecType>({
  eyes,
  storage,
  target: defaultTarget,
  spec,
  signal,
  logger: mainLogger,
}: Options<TSpec>) {
  return async function check({
    target = defaultTarget,
    settings = {},
    logger = mainLogger,
  }: {
    settings?: CheckSettings<TSpec>
    target?: Target<TSpec>
    logger?: Logger
  } = {}): Promise<CheckResult[]> {
    logger = logger.extend(mainLogger)

    logger.log('Command "check" is called with settings', settings)

    if (signal?.aborted) {
      logger.warn('Command "check" was called after test was already aborted')
      throw new AbortError('Command "check" was called after test was already aborted')
    }

    const {elementReferencesToCalculate, elementReferenceToTarget, getBaseCheckSettings} = toBaseCheckSettings({
      settings,
    })

    const uniqueRenderers = uniquifyRenderers(settings.renderers ?? [])
    const ufgClient = await eyes.core.getUFGClient({
      settings: {
        ...eyes.test.ufgServer,
        eyesServerUrl: eyes.test.eyesServer.eyesServerUrl,
        apiKey: eyes.test.eyesServer.apiKey,
      },
      logger,
    })

    let snapshots: DomSnapshot[] | AndroidSnapshot[] | IOSSnapshot[]
    let snapshotUrl: string | undefined
    let snapshotTitle: string | undefined
    let userAgent: string | undefined
    let regionToTarget: Selector | Region | undefined
    let scrollRootSelector: Selector | undefined
    let selectorsToCalculate: {originalSelector: Selector | null; safeSelector: Selector | null}[]

    const driver =
      spec && isDriver(target, spec)
        ? await makeDriver({spec, driver: target, reset: target === defaultTarget, logger})
        : null
    if (driver) {
      const environment = await driver.getEnvironment()
      await driver.currentContext.setScrollingElement(settings.scrollRootElement ?? null)
      if (uniqueRenderers.length === 0) {
        if (environment.isWeb) {
          const viewportSize = await driver.getViewportSize()
          uniqueRenderers.push({name: 'chrome', ...viewportSize})
        } else {
          // TODO add default nmg renderers
        }
      }
      let cleanupGeneratedSelectors
      if (environment.isWeb) {
        userAgent = await driver.getUserAgentLegacy()
        const generated = await generateSafeSelectors({
          context: driver.currentContext,
          elementReferences: [
            ...(elementReferenceToTarget ? [elementReferenceToTarget] : []),
            ...(settings.scrollRootElement ? [settings.scrollRootElement] : []),
            ...elementReferencesToCalculate,
          ],
        })
        cleanupGeneratedSelectors = generated.cleanupGeneratedSelectors
        selectorsToCalculate = generated.selectors
        if (elementReferenceToTarget) {
          if (!selectorsToCalculate[0]?.safeSelector) throw new Error('Target element not found')
          regionToTarget = selectorsToCalculate[0].safeSelector
          selectorsToCalculate = selectorsToCalculate.slice(1)
        }
        if (settings.scrollRootElement) {
          scrollRootSelector = selectorsToCalculate[0].safeSelector ?? undefined
          selectorsToCalculate = selectorsToCalculate.slice(1)
        }
      } else {
        regionToTarget = isSelector(elementReferenceToTarget)
          ? spec?.untransformSelector?.(settings.scrollRootElement) ?? undefined
          : undefined
        scrollRootSelector = isSelector(settings.scrollRootElement)
          ? spec?.untransformSelector?.(settings.scrollRootElement) ?? undefined
          : undefined
      }

      const currentContext = driver.currentContext

      const snapshotOptions = {
        settings: {
          ...eyes.test.eyesServer,
          waitBeforeCapture: settings.waitBeforeCapture,
          disableBrowserFetching: settings.disableBrowserFetching,
          layoutBreakpoints: settings.layoutBreakpoints,
          renderers: uniqueRenderers,
          skipResources: ufgClient.getCachedResourceUrls(),
        },
        hooks: {
          async beforeSnapshots() {
            if (settings.lazyLoad && environment.isWeb) {
              await waitForLazyLoad({
                context: driver.currentContext,
                settings: settings.lazyLoad !== true ? settings.lazyLoad : {},
                logger,
              })
            }
          },
        },
        provides: {
          getChromeEmulationDevices: ufgClient.getChromeEmulationDevices,
          getIOSDevices: ufgClient.getIOSDevices,
        },
      }
      if (environment.isWeb) {
        snapshots = await takeDomSnapshots({driver, ...snapshotOptions, logger})
      } else {
        const nmlClient = await eyes.core.getNMLClient({config: eyes.test.eyesServer, driver, logger})
        snapshots = (await nmlClient.takeSnapshots({...snapshotOptions, logger})) as AndroidSnapshot[] | IOSSnapshot[]
      }

      await currentContext.focus()
      snapshotUrl = await driver.getUrl()
      snapshotTitle = await driver.getTitle()

      await cleanupGeneratedSelectors?.()
    } else {
      snapshots = !utils.types.isArray(target) ? Array(uniqueRenderers.length).fill(target) : target
      snapshotUrl = utils.types.has(snapshots[0], 'url') ? snapshots[0].url : undefined
    }
    regionToTarget ??= (elementReferenceToTarget as Selector) ?? (settings.region as Region)
    selectorsToCalculate ??= elementReferencesToCalculate.map(selector => ({
      originalSelector: selector as Selector,
      safeSelector: selector as Selector,
    }))

    const promises = uniqueRenderers.map(async ({properties, ...renderer}, index) => {
      const rendererLogger = logger.extend({tags: [`renderer-${utils.general.shortid()}`]})

      if (utils.types.has(renderer, 'name') && renderer.name === 'edge') {
        const message = chalk.yellow(
          `The 'edge' option that is being used in your browsers' configuration will soon be deprecated. Please change it to either 'edgelegacy' for the legacy version or to 'edgechromium' for the new Chromium-based version. Please note, when using the built-in BrowserType enum, then the values are BrowserType.EDGE_LEGACY and BrowserType.EDGE_CHROMIUM, respectively.`,
        )
        rendererLogger.console.log(message)
      }

      try {
        if (signal?.aborted) {
          rendererLogger.warn('Command "check" was aborted before rendering')
          throw new AbortError('Command "check" was aborted before rendering')
        }

        const {cookies, ...snapshot} = snapshots[index] as (typeof snapshots)[number] & {cookies: Cookie[]}

        if (utils.types.has(renderer, 'iosDeviceInfo') || utils.types.has(renderer, 'androidDeviceInfo')) {
          renderer.type = utils.types.has(snapshot, 'cdt') ? 'web' : 'native'
        }

        const renderTargetPromise = ufgClient.createRenderTarget({
          snapshot,
          settings: {
            renderer,
            cookies,
            headers: {
              Referer: snapshotUrl,
              'User-Agent': userAgent,
              ...settings.headers,
            },
            proxy: eyes.test.eyesServer.proxy,
            autProxy: settings.autProxy,
          },
          logger: rendererLogger,
        })

        const [baseEyes] = await eyes.getBaseEyes({settings: {renderer, properties}, logger: rendererLogger})

        try {
          if (signal?.aborted) {
            rendererLogger.warn('Command "check" was aborted before rendering')
            throw new AbortError('Command "check" was aborted before rendering')
          } else if (!baseEyes.running) {
            rendererLogger.warn(
              `Render on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
            throw new AbortError(
              `Render on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
          }

          const renderTarget = await renderTargetPromise

          if (signal?.aborted) {
            rendererLogger.warn('Command "check" was aborted before rendering')
            throw new AbortError('Command "check" was aborted before rendering')
          } else if (!baseEyes.running) {
            rendererLogger.warn(
              `Render on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
            throw new AbortError(
              `Render on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
          }

          const {renderId, selectorRegions, ...baseTarget} = await ufgClient.render({
            target: renderTarget,
            settings: {
              ...settings,
              region: regionToTarget,
              scrollRootElement: scrollRootSelector,
              selectorsToCalculate: selectorsToCalculate.flatMap(({safeSelector}) => safeSelector ?? []),
              includeFullPageSize: Boolean(settings.pageId),
              renderer,
              renderEnvironmentId: baseEyes.test.renderEnvironmentId!,
              uploadUrl: baseEyes.test.uploadUrl,
              stitchingServiceUrl: baseEyes.test.stitchingServiceUrl,
            },
            signal,
            logger: rendererLogger,
          })
          let offset = 0
          const baseSettings = getBaseCheckSettings({
            calculatedRegions: selectorsToCalculate.map(({originalSelector, safeSelector}) => ({
              selector: originalSelector ?? undefined,
              regions: safeSelector ? selectorRegions![offset++] : [],
            })),
          })
          baseSettings.renderId = renderId
          baseTarget.source = snapshotUrl
          baseTarget.name = snapshotTitle

          if (signal?.aborted) {
            rendererLogger.warn('Command "check" was aborted after rendering')
            throw new AbortError('Command "check" was aborted after rendering')
          } else if (!baseEyes.running) {
            rendererLogger.warn(
              `Render on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
            throw new AbortError(
              `Render on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
          }

          await baseEyes.check({
            target: {...baseTarget, isTransformed: true},
            settings: baseSettings,
            logger: rendererLogger,
          })

          if (!baseEyes.running) {
            rendererLogger.warn(
              `Render on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
            throw new AbortError(
              `Render on environment with id "${baseEyes.test.renderEnvironmentId}" was aborted during one of the previous steps`,
            )
          }

          return {eyes: baseEyes, renderer}
        } catch (error: any) {
          rendererLogger.error(
            `Render on environment with id "${baseEyes.test.renderEnvironmentId}" failed due to an error`,
            error,
          )
          if (baseEyes.running && !signal?.aborted) await baseEyes.abort({logger: rendererLogger})
          error.info = {eyes: baseEyes}
          throw error
        }
      } catch (error: any) {
        rendererLogger.error(`Renderer with id ${renderer.id} failed before rendering started due to an error`, error)
        error.info = {...error.info, userTestId: eyes.test.userTestId, renderer}
        throw error
      }
    })

    return uniqueRenderers.map((renderer, index) => {
      const key = JSON.stringify(renderer)
      storage.set(key, [...(storage.get(key) ?? []), promises[index]])
      return {asExpected: true, userTestId: eyes.test.userTestId, renderer}
    })
  }
}
