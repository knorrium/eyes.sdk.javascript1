import {type Size} from '@applitools/utils'
import {type Logger} from '@applitools/logger'
import {type SpecType, type Driver} from '@applitools/driver'
import {type DomSnapshot, type Renderer} from '@applitools/ufg-client'
import {takeDomSnapshot, type DomSnapshotSettings} from './take-dom-snapshot'
import * as utils from '@applitools/utils'
import chalk from 'chalk'
import {type CalculateRegionsOptions, calculateRegions} from './calculate-regions'
import {SnapshotResult} from '../types'
import {waitForLazyLoad} from '../../automation/utils/wait-for-lazy-load'
import {type LazyLoadOptions} from '../types'

export * from './take-dom-snapshot'
export type DomSnapshotsSettings = DomSnapshotSettings & {
  renderers: Renderer[]
  waitBeforeCapture?: number | (() => void)
  layoutBreakpoints?: {breakpoints: number[] | boolean; reload?: boolean}
  calculateRegionsOptions?: CalculateRegionsOptions
  lazyLoad?: boolean | LazyLoadOptions
}

export async function takeDomSnapshots<TSpec extends SpecType>({
  driver,
  settings,
  hooks,
  provides,
  logger,
}: {
  driver: Driver<TSpec>
  settings: DomSnapshotsSettings
  hooks?: {beforeEachSnapshot?(): void | Promise<void>}
  provides?: {
    getChromeEmulationDevices(): Promise<Record<string, Record<string, Size>>>
    getIOSDevices(): Promise<Record<string, Record<string, Size>>>
  }
  logger: Logger
}): Promise<SnapshotResult<DomSnapshot>[]> {
  const currentContext = driver.currentContext
  let calculateRegionsResults: Partial<Awaited<ReturnType<typeof calculateRegions<TSpec>>>> = {}
  const waitBeforeCapture = async () => {
    if (utils.types.isFunction(settings.waitBeforeCapture)) {
      await settings.waitBeforeCapture()
    } else if (settings.waitBeforeCapture) {
      await utils.general.sleep(settings.waitBeforeCapture)
    }
  }
  if (settings.lazyLoad) {
    await waitForLazyLoad({
      context: driver.currentContext,
      settings: settings.lazyLoad !== true ? settings.lazyLoad : {},
      logger,
    })
  }
  if (!settings.layoutBreakpoints?.reload && settings.calculateRegionsOptions) {
    calculateRegionsResults = await calculateRegions({
      ...settings.calculateRegionsOptions,
      driver,
    })
  }
  if (!settings.layoutBreakpoints) {
    logger.log(`taking single dom snapshot`)
    await hooks?.beforeEachSnapshot?.()
    await waitBeforeCapture()
    const snapshot = await takeDomSnapshot({context: currentContext, settings, logger})
    await calculateRegionsResults?.cleanupGeneratedSelectors?.()
    return Array(settings.renderers.length).fill({snapshot, ...calculateRegionsResults})
  }

  const isStrictBreakpoints = utils.types.isArray(settings.layoutBreakpoints?.breakpoints)

  const requiredWidths = await settings.renderers.reduce(async (prev, renderer, index) => {
    const {name, width} = (await extractRendererInfo({renderer}))!
    const requiredWidths = await prev
    const requiredWidth = isStrictBreakpoints
      ? calculateBreakpoint({breakpoints: settings.layoutBreakpoints!.breakpoints as number[], value: width})
      : width
    let renderers = requiredWidths.get(requiredWidth)
    if (!renderers) requiredWidths.set(requiredWidth, (renderers = []))
    renderers.push({name, width, index})
    return requiredWidths
  }, Promise.resolve(new Map<number, {name: string; width: number; index: number}[]>()))

  const smallestBreakpoint = Math.min(
    ...(isStrictBreakpoints ? (settings.layoutBreakpoints.breakpoints as number[]) : []),
  )

  if (isStrictBreakpoints && requiredWidths.has(smallestBreakpoint - 1)) {
    const smallestBrowsers = requiredWidths
      .get(smallestBreakpoint - 1)!
      .map(({name, width}) => `(${name}, ${width})`)
      .join(', ')
    const message = chalk.yellow(
      `The following configuration's viewport-widths are smaller than the smallest configured layout breakpoint (${smallestBreakpoint} pixels): [${smallestBrowsers}]. As a fallback, the resources that will be used for these configurations have been captured on a viewport-width of ${smallestBreakpoint} - 1 pixels. If an additional layout breakpoint is needed for you to achieve better results - please add it to your configuration.`,
    )
    logger.console.log(message)
  }

  logger.log(`taking multiple dom snapshots for breakpoints:`, settings.layoutBreakpoints.breakpoints)
  logger.log(`required widths: ${[...requiredWidths.keys()].join(', ')}`)
  const viewportSize = await driver.getViewportSize()
  const snapshotsResults: SnapshotResult<DomSnapshot>[] = Array(settings.renderers.length)
  if (requiredWidths.has(viewportSize.width)) {
    logger.log(`taking dom snapshot for existing width ${viewportSize.width}`)
    await hooks?.beforeEachSnapshot?.()
    await waitBeforeCapture()
    const snapshot = await takeDomSnapshot({context: currentContext, settings, logger})
    requiredWidths.get(viewportSize.width)!.forEach(({index}) => {
      snapshotsResults[index] = {snapshot, ...calculateRegionsResults}
    })
  }
  for (const [requiredWidth, browsersInfo] of requiredWidths.entries()) {
    logger.log(`taking dom snapshot for width ${requiredWidth}`)
    try {
      await driver.setViewportSize({width: requiredWidth, height: viewportSize.height})
      if (settings.layoutBreakpoints.reload) {
        await driver.reloadPage()
        await waitBeforeCapture()
        if (settings.calculateRegionsOptions) {
          calculateRegionsResults = await calculateRegions({
            ...settings.calculateRegionsOptions,
            driver,
          })
        }
      }
    } catch (err) {
      logger.error(err)
      const actualViewportSize = await driver.getViewportSize()
      if (isStrictBreakpoints) {
        const failedBrowsers = browsersInfo.map(({name, width}) => `(${name}, ${width})`).join(', ')
        const message = chalk.yellow(
          `One of the configured layout breakpoints is ${requiredWidth} pixels, while your local browser has a limit of ${actualViewportSize.width}, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for the following configurations: [${failedBrowsers}] have been captured on the browser's limit (${actualViewportSize.width} pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
        )
        logger.console.log(message)
        logger.log(message)
      } else {
        const failedBrowsers = browsersInfo.map(({name}) => `(${name})`).join(', ')
        const message = chalk.yellow(
          `The following configurations [${failedBrowsers}] have a viewport-width of ${requiredWidth} pixels, while your local browser has a limit of ${actualViewportSize.width} pixels, so the SDK couldn't resize it to the desired size. As a fallback, the resources that will be used for these checkpoints have been captured on the browser's limit (${actualViewportSize.width} pixels). To resolve this, you may use a headless browser as it can be resized to any size.`,
        )
        logger.console.log(message)
        logger.log(message)
      }
    }
    await hooks?.beforeEachSnapshot?.()
    await waitBeforeCapture()
    const snapshot = await takeDomSnapshot({context: currentContext, settings, logger})
    browsersInfo.forEach(({index}) => {
      snapshotsResults[index] = {snapshot, ...calculateRegionsResults}
    })
  }

  await driver.setViewportSize(viewportSize)
  if (settings.layoutBreakpoints.reload) {
    await driver.reloadPage()
    await waitBeforeCapture()
  } else {
    calculateRegionsResults?.cleanupGeneratedSelectors?.()
  }
  return snapshotsResults

  function calculateBreakpoint({breakpoints, value}: {breakpoints: number[]; value: number}): number {
    const nextBreakpointIndex = breakpoints
      .sort((item1, item2) => (item1 > item2 ? 1 : -1))
      .findIndex(breakpoint => breakpoint > value)
    if (nextBreakpointIndex === -1) return breakpoints[breakpoints.length - 1]
    else if (nextBreakpointIndex === 0) return breakpoints[0] - 1
    else return breakpoints[nextBreakpointIndex - 1]
  }

  async function extractRendererInfo({renderer}: {renderer: Renderer}) {
    if (utils.types.has(renderer, ['width', 'height'])) {
      const {name, width, height} = renderer
      return {name: name ?? 'default', width, height}
    } else if (utils.types.has(renderer, 'chromeEmulationInfo')) {
      const devices = await provides!.getChromeEmulationDevices()
      const {deviceName, screenOrientation = 'portrait'} = renderer.chromeEmulationInfo
      return {name: deviceName, screenOrientation, ...devices[deviceName][screenOrientation]}
    } else if (utils.types.has(renderer, 'iosDeviceInfo')) {
      const devices = await provides!.getIOSDevices()
      const {deviceName, screenOrientation = 'portrait'} = renderer.iosDeviceInfo
      return {name: deviceName, screenOrientation, ...devices[deviceName][screenOrientation]}
    }
  }
}
