import type {Core, DriverTarget, Eyes, OpenSettings} from './types'
import type {Eyes as BaseEyes} from '@applitools/core-base'
import {type Logger} from '@applitools/logger'
import {makeDriver, type SpecType, type SpecDriver} from '@applitools/driver'
import {makeGetBaseEyes} from './get-base-eyes'
import {makeCheck} from './check'
import {makeCheckAndClose} from './check-and-close'
import {makeClose} from './close'
import {makeAbort} from './abort'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType> = {
  core: Core<TSpec>
  spec?: SpecDriver<TSpec>
  logger: Logger
}

export function makeOpenEyes<TSpec extends SpecType>({core, spec, logger: defaultLogger}: Options<TSpec>) {
  return async function openEyes({
    target,
    settings,
    base,
    logger = defaultLogger,
  }: {
    target?: DriverTarget<TSpec>
    settings: OpenSettings
    base?: BaseEyes[]
    logger?: Logger
  }): Promise<Eyes<TSpec>> {
    logger.log(
      `Command "openEyes" is called with ${target ? 'default driver and' : ''}`,
      ...(settings ? ['settings', settings] : []),
      base ? 'predefined eyes' : '',
    )

    const driver = target && (await makeDriver({spec, driver: target, logger, customConfig: settings}))
    if (driver && !base) {
      const currentContext = driver.currentContext
      settings.environment ??= {}
      if (driver.isEC) {
        settings.environment.ecSessionId = driver.sessionId
      }
      if (driver.isWeb) {
        settings.environment.userAgent ??= driver.userAgent
      }
      if (!settings.environment.deviceName && driver.deviceName) {
        settings.environment.deviceName = driver.deviceName
      }
      if (!settings.environment.os) {
        if (driver.isNative && driver.platformName) {
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
        } else if (
          driver.isChromium &&
          ((driver.isWindows && Number.parseInt(driver.browserVersion as string) >= 107) ||
            (driver.isMac && Number.parseInt(driver.browserVersion as string) >= 90))
        ) {
          settings.environment.os = `${driver.platformName} ${driver.platformVersion ?? ''}`.trim()
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

    base ??= [await core.base.openEyes({settings, logger})]
    return utils.general.extend(base[0], eyes => ({
      type: 'classic' as const,
      core,
      getBaseEyes: makeGetBaseEyes({settings, eyes, base, logger}),
      check: makeCheck({eyes, target: driver, spec, logger}),
      checkAndClose: makeCheckAndClose({eyes, target: driver, spec, logger}),
      close: makeClose({eyes, target: driver, spec, logger}),
      abort: makeAbort({eyes, target: driver, spec, logger}),
    }))
  }
}
