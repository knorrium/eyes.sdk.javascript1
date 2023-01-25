import type {DriverTarget, Eyes, OpenSettings} from './types'
import type {Core as BaseCore, Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, type SpecDriver} from '@applitools/driver'
import {makeGetBaseEyes} from './get-base-eyes'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeLocateText} from './locate-text'
import {makeExtractText} from './extract-text'
import {makeClose} from './close'
import {makeAbort} from './abort'
import * as utils from '@applitools/utils'

type Options<TDriver, TContext, TElement, TSelector> = {
  core: BaseCore
  spec?: SpecDriver<TDriver, TContext, TElement, TSelector>
  logger?: Logger
}

export function makeOpenEyes<TDriver, TContext, TElement, TSelector>({
  core,
  spec,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector>) {
  return async function openEyes({
    target,
    settings,
    eyes,
    logger = defaultLogger,
  }: {
    target?: DriverTarget<TDriver, TContext, TElement, TSelector>
    settings: OpenSettings
    eyes?: BaseEyes[]
    logger?: Logger
  }): Promise<Eyes<TDriver, TContext, TElement, TSelector>> {
    logger.log(
      `Command "openEyes" is called with ${target ? 'default driver and' : ''}`,
      ...(settings ? ['settings', settings] : []),
      eyes ? 'predefined eyes' : '',
    )
    const driver = target && (await makeDriver({spec, driver: target, logger, customConfig: settings}))
    if (driver && !eyes) {
      const currentContext = driver.currentContext
      settings.environment ??= {}
      if (driver.isEC) {
        settings.environment.ecSessionId = driver.sessionId
      }
      if (driver.isWeb) {
        settings.environment.userAgent ??= driver.userAgent
        if (
          driver.isChromium &&
          ((driver.isWindows && Number.parseInt(driver.browserVersion as string) >= 107) ||
            (driver.isMac && Number.parseInt(driver.browserVersion as string) >= 90))
        ) {
          settings.environment.os = `${driver.platformName} ${driver.platformVersion ?? ''}`.trim()
        }
      }
      if (!settings.environment.deviceName && driver.deviceName) {
        settings.environment.deviceName = driver.deviceName
      }
      if (!settings.environment.os && driver.isNative && driver.platformName) {
        settings.environment.os = driver.platformName
        if (!settings.keepPlatformNameAsIs) {
          if (settings.environment.os?.startsWith('android')) {
            settings.environment.os = `Android${settings.environment.os.slice(7)}`
          }
          if (settings.environment.os?.startsWith('ios')) {
            settings.environment.os = `iOS${settings.environment.os.slice(3)}`
          }
        }
        if (driver.platformVersion) {
          settings.environment.os += ` ${driver.platformVersion}`
        }
      }
      if (!settings.environment.viewportSize || driver.isMobile) {
        const size = await driver.getViewportSize()
        settings.environment.viewportSize = utils.geometry.scale(size, driver.viewportScale)
      } else {
        await driver.setViewportSize(settings.environment.viewportSize)
      }
      await currentContext.focus()
    }
    const getBaseEyes = makeGetBaseEyes({settings, core, eyes, logger})
    const [baseEyes] = await getBaseEyes()

    return utils.general.extend(baseEyes, eyes => ({
      type: 'classic' as const,
      getBaseEyes,
      check: makeCheck({eyes, target: driver, spec, logger}),
      checkAndClose: makeCheckAndClose({eyes, target: driver, spec, logger}),
      locateText: makeLocateText({eyes, target: driver, spec, logger}),
      extractText: makeExtractText({eyes, target: driver, spec, logger}),
      close: makeClose({eyes, target: driver, spec, logger}),
      abort: makeAbort({eyes, target: driver, spec, logger}),
    }))
  }
}
