import type {Region} from '@applitools/utils'
import type {DriverTarget, Target, Eyes, CheckSettings, Renderer, SnapshotResult} from './types'
import {
  type Renderer as UFGRenderer,
  type DomSnapshot,
  type AndroidSnapshot,
  type IOSSnapshot,
} from '@applitools/ufg-client'
import {type Renderer as NMLRenderer} from '@applitools/nml-client'
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
import {uniquifyRenderers} from '../automation/utils/uniquify-renderers'
import {extractRendererKey} from '../automation/utils/extract-renderer-key'
import {AbortError} from '../errors/abort-error'
import * as utils from '@applitools/utils'
import chalk from 'chalk'

type Options<TSpec extends SpecType> = {
  eyes: Eyes<TSpec>
  target?: DriverTarget<TSpec>
  renderers?: Renderer[]
  spec?: SpecDriver<TSpec>
  signal?: AbortSignal
  logger: Logger
}

export function makeCheck<TSpec extends SpecType>({
  eyes,
  target: defaultTarget,
  renderers: defaultRenderers = [],
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
  } = {}): Promise<void> {
    logger = logger.extend(mainLogger)

    logger.log('Command "check" is called with settings', settings)

    if (signal?.aborted) {
      logger.warn('Command "check" was called after test was already aborted')
      throw new AbortError('Command "check" was called after test was already aborted')
    }

    const {elementReferencesToCalculate, elementReferenceToTarget, getBaseCheckSettings} = toBaseCheckSettings({
      settings,
    })

    const uniqueRenderers = uniquifyRenderers(settings.renderers ?? defaultRenderers)
    const ufgClient = await eyes.core.getUFGClient({
      settings: {
        ...eyes.test.ufgServer,
        eyesServerUrl: eyes.test.eyesServer.eyesServerUrl,
        apiKey: eyes.test.eyesServer.apiKey,
      },
      logger,
    })

    let snapshotResults: SnapshotResult<DomSnapshot | AndroidSnapshot | IOSSnapshot>[]
    let snapshotUrl: string | undefined
    let snapshotTitle: string | undefined
    let userAgent: string | undefined

    const driver =
      spec && isDriver(target, spec)
        ? await makeDriver({spec, driver: target, reset: target === defaultTarget, logger})
        : null
    if (driver) {
      const environment = await driver.getEnvironment()
      const currentContext = driver.currentContext
      await currentContext.setScrollingElement(settings.scrollRootElement ?? null)
      if (environment.isWeb) {
        userAgent = await driver.getUserAgentLegacy()
        snapshotResults = await takeDomSnapshots({
          driver,
          settings: {
            ...eyes.test.eyesServer,
            waitBeforeCapture: settings.waitBeforeCapture,
            disableBrowserFetching: settings.disableBrowserFetching,
            layoutBreakpoints: settings.layoutBreakpoints,
            renderers: uniqueRenderers as UFGRenderer[],
            skipResources: ufgClient.getCachedResourceUrls(),
            calculateRegionsOptions: {
              elementReferencesToCalculate,
              elementReferenceToTarget,
              scrollRootElement: settings.scrollRootElement,
            },
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
          logger,
        })
      } else {
        const nmlClient = await eyes.core.getNMLClient({
          driver,
          settings: {...eyes.test.eyesServer, renderEnvironmentsUrl: eyes.test.renderEnvironmentsUrl},
          logger,
        })
        const snapshots = (await nmlClient.takeSnapshots({
          settings: {
            ...eyes.test.eyesServer,
            waitBeforeCapture: settings.waitBeforeCapture,
            renderers: uniqueRenderers as NMLRenderer[],
          },
          logger,
        })) as AndroidSnapshot[] | IOSSnapshot[]

        snapshotResults = snapshots.map(snapshot => ({
          snapshot,
          regionToTarget: isSelector(elementReferenceToTarget)
            ? spec?.toSimpleCommonSelector?.(settings.scrollRootElement) ?? undefined
            : undefined,
          scrollRootSelector: isSelector(settings.scrollRootElement)
            ? spec?.toSimpleCommonSelector?.(settings.scrollRootElement) ?? undefined
            : undefined,
        }))
      }

      await currentContext.focus()
      snapshotUrl = await driver.getUrl()
      snapshotTitle = await driver.getTitle()
    } else {
      snapshotResults = !utils.types.isArray(target) ? Array(uniqueRenderers.length).fill(target) : target
      snapshotUrl = utils.types.has(snapshotResults[0]?.snapshot, 'url') ? snapshotResults[0].snapshot.url : undefined
    }

    const promises = uniqueRenderers.map(async (renderer, index) => {
      const rendererLogger = logger.extend({tags: [`renderer-${utils.general.shortid()}`]})

      const ufgRenderer = renderer as UFGRenderer

      if (utils.types.has(ufgRenderer, 'name') && ufgRenderer.name === 'edge') {
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

        const {
          snapshot: snapshotFromResult,
          selectorsToCalculate: selectorsToCalculateFromSnapshot,
          regionToTarget,
          scrollRootSelector,
        } = snapshotResults[index]
        const {cookies, ...snapshot} = snapshotFromResult as (typeof snapshotResults)[number]['snapshot'] & {
          cookies: Cookie[]
        }

        const region = regionToTarget ?? (elementReferenceToTarget as Selector) ?? (settings.region as Region)
        const selectorsToCalculate =
          selectorsToCalculateFromSnapshot ??
          elementReferencesToCalculate.map(selector => ({
            originalSelector: selector as Selector,
            safeSelector: selector as Selector,
          }))

        if (utils.types.has(ufgRenderer, 'iosDeviceInfo') || utils.types.has(ufgRenderer, 'androidDeviceInfo')) {
          ufgRenderer.type = utils.types.has(snapshot, 'cdt') ? 'web' : 'native'
        }

        const renderTargetPromise = ufgClient.createRenderTarget({
          snapshot,
          settings: {
            renderer: ufgRenderer,
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

        const baseEyes = await eyes.getBaseEyes({settings: {renderer}, logger: rendererLogger})
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
              region,
              scrollRootElement: scrollRootSelector,
              selectorsToCalculate: selectorsToCalculate.flatMap(({safeSelector}) => safeSelector ?? []),
              includeFullPageSize: Boolean(settings.pageId),
              renderer: ufgRenderer,
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
        rendererLogger.error(
          `Renderer with id ${ufgRenderer.id} failed before rendering started due to an error`,
          error,
        )
        error.info = {...error.info, userTestId: eyes.test.userTestId, renderer: ufgRenderer}
        throw error
      }
    })

    uniqueRenderers.forEach((renderer, index) => {
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
