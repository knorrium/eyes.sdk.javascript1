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
      const environment = await driver.getEnvironment()
      const currentContext = driver.currentContext
      settings.environment ??= {}
      if (environment.isEC) {
        settings.environment.ecSessionId = (await driver.getSessionId())!
      }
      if (environment.isWeb) {
        settings.environment.userAgent ??= await driver.getUserAgentLegacy()
      }
      if (!settings.environment.deviceName && environment.deviceName) {
        settings.environment.deviceName = environment.deviceName
      }
      if (!settings.environment.os) {
        if (environment.isNative && environment.platformName) {
          settings.environment.os = environment.platformName
          if (!settings.keepPlatformNameAsIs) {
            if (/^android/i.test(settings.environment.os)) {
              settings.environment.os = `Android${settings.environment.os.slice(7)}`
            }
            if (/^ios/i.test(settings.environment.os)) {
              settings.environment.os = `iOS${settings.environment.os.slice(3)}`
            }
          }
          if (environment.platformVersion) {
            settings.environment.os += ` ${environment.platformVersion}`
          }
        } else if (
          environment.isReliable &&
          environment.isChromium &&
          ((environment.isWindows && Number.parseInt(environment.browserVersion as string) >= 107) ||
            (environment.isMac && Number.parseInt(environment.browserVersion as string) >= 90))
        ) {
          settings.environment.os = `${environment.platformName} ${environment.platformVersion ?? ''}`.trim()
        }
      }
      if (!settings.environment.viewportSize || environment.isMobile) {
        const viewport = await driver.getViewport()
        const size = await driver.getViewportSize()
        settings.environment.viewportSize = utils.geometry.scale(size, viewport.viewportScale)
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
