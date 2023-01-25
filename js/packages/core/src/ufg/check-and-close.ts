import type {Region} from '@applitools/utils'
import type {DriverTarget, UFGTarget, Eyes, CheckSettings, TestResult, CloseSettings} from './types'
import {type DomSnapshot, type AndroidSnapshot, type IOSSnapshot} from '@applitools/ufg-client'
import {type AbortSignal} from 'abort-controller'
import {type Logger} from '@applitools/logger'
import {type UFGClient} from '@applitools/ufg-client'
import {makeDriver, isDriver, type SpecDriver, type Selector, type Cookie} from '@applitools/driver'
import {takeSnapshots} from './utils/take-snapshots'
import {waitForLazyLoad} from '../utils/wait-for-lazy-load'
import {toBaseCheckSettings} from '../utils/to-base-check-settings'
import {generateSafeSelectors} from './utils/generate-safe-selectors'
import {uniquifyRenderers} from './utils/uniquify-renderers'
import {AbortError} from '../errors/abort-error'
import * as utils from '@applitools/utils'
import chalk from 'chalk'

type Options<TDriver, TContext, TElement, TSelector> = {
  eyes: Eyes<TDriver, TContext, TElement, TSelector>
  client: UFGClient
  target?: DriverTarget<TDriver, TContext, TElement, TSelector>
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  signal?: AbortSignal
  logger?: Logger
}

export function makeCheckAndClose<TDriver, TContext, TElement, TSelector>({
  spec,
  eyes,
  client,
  signal,
  target: defaultTarget,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function checkAndClose({
    target = defaultTarget,
    settings = {},
    logger = defaultLogger,
    snapshots,
  }: {
    target?: UFGTarget<TDriver, TContext, TElement, TSelector>
    settings?: CheckSettings<TElement, TSelector> & CloseSettings
    logger?: Logger
    snapshots?: DomSnapshot[] | AndroidSnapshot[] | IOSSnapshot[]
  }): Promise<TestResult[]> {
    logger.log('Command "checkAndClose" is called with settings', settings)

    if (signal.aborted) {
      logger.warn('Command "checkAndClose" was called after test was already aborted')
      throw new AbortError('Command "checkAndClose" was called after test was already aborted')
    }

    const {elementReferencesToCalculate, elementReferenceToTarget, getBaseCheckSettings} = toBaseCheckSettings({settings})

    let snapshotUrl: string
    let snapshotTitle: string
    let userAgent: string
    let regionToTarget: Selector | Region
    let selectorsToCalculate: {originalSelector: Selector; safeSelector: Selector}[]
    const uniqueRenderers = uniquifyRenderers(settings.renderers ?? [])
    if (isDriver(target, spec)) {
      const driver = await makeDriver({spec, driver: target, logger})
      if (uniqueRenderers.length === 0) {
        if (driver.isWeb) {
          const viewportSize = await driver.getViewportSize()
          uniqueRenderers.push({name: 'chrome', ...viewportSize})
        } else {
          // TODO add default nmg renderers
        }
      }
      let cleanupGeneratedSelectors
      if (driver.isWeb) {
        userAgent = driver.userAgent
        const generated = await generateSafeSelectors({
          context: driver.currentContext,
          elementReferences: [...(elementReferenceToTarget ? [elementReferenceToTarget] : []), ...elementReferencesToCalculate],
        })
        cleanupGeneratedSelectors = generated.cleanupGeneratedSelectors
        if (elementReferenceToTarget) {
          regionToTarget = generated.selectors[0]?.safeSelector
          if (!regionToTarget) throw new Error('Target element not found')
          selectorsToCalculate = generated.selectors.slice(1)
        } else {
          selectorsToCalculate = generated.selectors
        }
      }

      const currentContext = driver.currentContext
      if (!snapshots) {
        snapshots = await takeSnapshots({
          driver,
          settings: {
            ...eyes.test.server,
            waitBeforeCapture: settings.waitBeforeCapture,
            disableBrowserFetching: settings.disableBrowserFetching,
            layoutBreakpoints: settings.layoutBreakpoints,
            renderers: settings.renderers,
            skipResources: client.getCachedResourceUrls(),
          },
          hooks: {
            async beforeSnapshots() {
              if (driver.isWeb && settings.lazyLoad) {
                await waitForLazyLoad({
                  context: driver.currentContext,
                  settings: settings.lazyLoad !== true ? settings.lazyLoad : {},
                  logger,
                })
              }
            },
          },
          provides: {
            getChromeEmulationDevices: client.getChromeEmulationDevices,
            getIOSDevices: client.getIOSDevices,
          },
          logger,
        })
      }
      await currentContext.focus()
      snapshotUrl = await driver.getUrl()
      snapshotTitle = await driver.getTitle()

      await cleanupGeneratedSelectors?.()
    } else {
      snapshots = !utils.types.isArray(target) ? Array(settings.renderers.length).fill(target) : target
      snapshotUrl = utils.types.has(snapshots[0], 'url') ? snapshots[0].url : undefined
    }
    regionToTarget ??= (elementReferenceToTarget as Selector) ?? (settings.region as Region)
    selectorsToCalculate ??= elementReferencesToCalculate.map(selector => ({
      originalSelector: selector as Selector,
      safeSelector: selector as Selector,
    }))

    const promises = settings.renderers.map(async (renderer, index) => {
      if (utils.types.has(renderer, 'name') && renderer.name === 'edge') {
        const message = chalk.yellow(
          `The 'edge' option that is being used in your browsers' configuration will soon be deprecated. Please change it to either 'edgelegacy' for the legacy version or to 'edgechromium' for the new Chromium-based version. Please note, when using the built-in BrowserType enum, then the values are BrowserType.EDGE_LEGACY and BrowserType.EDGE_CHROMIUM, respectively.`,
        )
        logger.console.log(message)
      }

      try {
        if (signal.aborted) {
          logger.warn('Command "check" was aborted before rendering')
          throw new AbortError('Command "check" was aborted before rendering')
        }

        const {cookies, ...snapshot} = snapshots[index] as typeof snapshots[number] & {cookies: Cookie[]}
        const snapshotType = utils.types.has(snapshot, 'cdt') ? 'web' : 'native'
        const renderTargetPromise = client.createRenderTarget({
          snapshot,
          settings: {
            renderer,
            referer: snapshotUrl,
            cookies,
            proxy: eyes.test.server.proxy,
            autProxy: settings.autProxy,
            userAgent,
          },
        })

        const [baseEyes] = await eyes.getBaseEyes({settings: {renderer, type: snapshotType}, logger})

        try {
          if (signal.aborted) {
            logger.warn('Command "check" was aborted before rendering')
            throw new AbortError('Command "check" was aborted before rendering')
          } else if (baseEyes.aborted) {
            logger.warn(`Renderer with id ${baseEyes.test.rendererId} was aborted during one of the previous steps`)
            throw new AbortError(`Renderer with id "${baseEyes.test.rendererId}" was aborted during one of the previous steps`)
          }

          const renderTarget = await renderTargetPromise

          if (signal.aborted) {
            logger.warn('Command "check" was aborted before rendering')
            throw new AbortError('Command "check" was aborted before rendering')
          } else if (baseEyes.aborted) {
            logger.warn(`Renderer with id ${baseEyes.test.rendererId} was aborted during one of the previous steps`)
            throw new AbortError(`Renderer with id "${baseEyes.test.rendererId}" was aborted during one of the previous steps`)
          }

          const {renderId, selectorRegions, ...baseTarget} = await client.render({
            target: renderTarget,
            settings: {
              ...settings,
              rendererId: baseEyes.test.rendererId,
              region: regionToTarget,
              type: utils.types.has(snapshot, 'cdt') ? 'web' : 'native',
              renderer,
              selectorsToCalculate: selectorsToCalculate.flatMap(({safeSelector}) => safeSelector ?? []),
              includeFullPageSize: Boolean(settings.pageId),
            },
            signal,
          })
          let offset = 0
          const baseSettings = getBaseCheckSettings({
            calculatedRegions: selectorsToCalculate.map(({originalSelector, safeSelector}) => ({
              selector: originalSelector,
              regions: safeSelector ? selectorRegions[offset++] : [],
            })),
          })
          baseSettings.renderId = renderId
          baseTarget.source = snapshotUrl
          baseTarget.name = snapshotTitle

          if (signal.aborted) {
            logger.warn('Command "check" was aborted after rendering')
            throw new AbortError('Command "check" was aborted after rendering')
          } else if (baseEyes.aborted) {
            logger.warn(`Renderer with id ${baseEyes.test.rendererId} was aborted during one of the previous steps`)
            throw new AbortError(`Renderer with id "${baseEyes.test.rendererId}" was aborted during one of the previous steps`)
          }

          const [result] = await baseEyes.checkAndClose({
            target: {...baseTarget, isTransformed: true},
            settings: baseSettings,
            logger,
          })

          if (baseEyes.aborted) {
            logger.warn(`Renderer with id ${baseEyes.test.rendererId} was aborted during one of the previous steps`)
            throw new AbortError(`Renderer with id "${baseEyes.test.rendererId}" was aborted during one of the previous steps`)
          }

          return {...result, eyes, renderer}
        } catch (error) {
          await baseEyes.abort()
          error.info = {eyes: baseEyes}
          throw error
        }
      } catch (error) {
        error.info = {...error.info, userTestId: eyes.test.userTestId, renderer}
        throw error
      }
    })

    return Promise.all(
      promises.map(async promise => {
        try {
          const result = await promise
          return {...result, userTestId: eyes.test.userTestId, asExpected: true}
        } catch (error) {
          await error.info?.eyes?.abort({logger})
          throw error
        }
      }),
    )
  }
}
