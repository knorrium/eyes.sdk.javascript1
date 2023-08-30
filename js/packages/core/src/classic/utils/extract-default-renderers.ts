import type {EnvironmentRenderer, Environment} from '../types'
import {type SpecType, type Driver} from '@applitools/driver'
import * as utils from '@applitools/utils'

export async function extractDefaultRenderers<TSpec extends SpecType>({
  driver,
  settings,
}: {
  driver?: Driver<TSpec>
  settings?: {keepPlatformNameAsIs?: boolean; environment?: Environment}
}): Promise<EnvironmentRenderer[]> {
  const renderer = {environment: {}} as EnvironmentRenderer

  if (!driver) {
    renderer.environment = settings?.environment ?? {}
    return [renderer]
  }

  const currentContext = driver.currentContext
  try {
    const environment = await driver.getEnvironment()
    const viewport = await driver.getViewport()
    const size = await driver.getViewportSize()
    renderer.environment.viewportSize = utils.geometry.scale(size, viewport.viewportScale)
    if (environment.isEC) renderer.environment.ecSessionId = (await driver.getSessionId()) ?? undefined
    if (environment.isWeb) renderer.environment.userAgent = await driver.getUserAgentLegacy()
    if (environment.deviceName) renderer.environment.deviceName = environment.deviceName
    if (environment.isNative && environment.platformName) {
      renderer.environment.os = environment.platformName
      if (environment.platformVersion) renderer.environment.os += ` ${environment.platformVersion}`
      if (!settings?.keepPlatformNameAsIs) {
        if (/^android/i.test(renderer.environment.os)) {
          renderer.environment.os = `Android${renderer.environment.os.slice(7)}`
        }
        if (/^ios/i.test(renderer.environment.os)) {
          renderer.environment.os = `iOS${renderer.environment.os.slice(3)}`
        }
      }
    } else if (
      environment.isReliable &&
      environment.isChromium &&
      ((environment.isWindows && Number.parseInt(environment.browserVersion!) >= 107) ||
        (environment.isMac && Number.parseInt(environment.browserVersion!) >= 90))
    ) {
      renderer.environment.os = `${environment.platformName} ${environment.platformVersion ?? ''}`.trim()
    }

    return [renderer]
  } finally {
    await currentContext.focus()
  }
}
