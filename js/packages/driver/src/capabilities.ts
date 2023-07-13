import type {Size} from '@applitools/utils'
import type {Capabilities, Environment, Viewport} from './types'
import * as utils from '@applitools/utils'

export function extractCapabilitiesEnvironment(capabilities: Capabilities): Partial<Environment> {
  if (capabilities.capabilities) capabilities = capabilities.capabilities as Capabilities

  const environment: Environment = {
    browserName:
      !(capabilities.app ?? capabilities['appium:app'] ?? capabilities['appium:desired']?.app) && !capabilities.bundleId
        ? (capabilities.browserName ?? capabilities.desired?.browserName) || undefined
        : undefined,
    browserVersion: (capabilities.browserVersion ?? capabilities.version) || undefined,
    platformName:
      (capabilities.platformName ??
        (capabilities.desired ?? capabilities['appium:desired'])?.platformName ??
        capabilities.platform) ||
      undefined,
    platformVersion:
      (capabilities.platformVersion ??
        capabilities['appium:platformVersion'] ??
        capabilities['appium:desired']?.platformVersion) ||
      undefined,
    isW3C: isW3C(capabilities),
    isMobile: isMobile(capabilities),
    isChrome: isChrome(capabilities),
    isECClient: !!capabilities['applitools:isECClient'],
  }

  if (environment?.isMobile) {
    environment.deviceName =
      ((capabilities['appium:desired'] ?? capabilities.desired)?.deviceName ??
        capabilities['appium:deviceName'] ??
        capabilities.deviceName) ||
      undefined
    environment.isIOS = isIOS(capabilities)
    environment.isAndroid = isAndroid(capabilities)
    if (!environment.browserName) {
      environment.isNative = true
      if (environment.isAndroid) {
        environment.isApplitoolsLib = !!capabilities.optionalIntentArguments?.includes('APPLITOOLS_API_KEY')
      } else if (environment.isIOS) {
        environment.isApplitoolsLib = utils.types.isString(capabilities.processArguments)
          ? capabilities.processArguments.includes('APPLITOOLS_API_KEY')
          : !!capabilities.processArguments?.env?.APPLITOOLS_API_KEY
      }
    } else if (
      environment.isIOS &&
      capabilities.CFBundleIdentifier &&
      !/mobilesafari/i.test(capabilities.CFBundleIdentifier)
    ) {
      environment.browserName = undefined
      environment.isNative = true
    } else {
      environment.isNative = false
    }
  }

  return environment
}

export function extractCapabilitiesViewport(capabilities: Capabilities): Partial<Viewport> {
  if (capabilities.capabilities) capabilities = capabilities.capabilities as Capabilities

  const viewport: Partial<Viewport> = {
    displaySize: extractDisplaySize(capabilities),
    orientation: (
      capabilities['appium:orientation'] ??
      capabilities.deviceOrientation ??
      capabilities.orientation
    )?.toLowerCase(),
    pixelRatio: capabilities['appium:pixelRatio'] ?? capabilities.pixelRatio,
    statusBarSize:
      capabilities['appium:statBarHeight'] ??
      capabilities.statBarHeight ??
      (capabilities['appium:viewportRect'] ?? capabilities.viewportRect)?.top,
  }

  if (
    viewport.displaySize &&
    viewport.orientation &&
    (capabilities['appium:viewportRect'] ?? capabilities.viewportRect)
  ) {
    viewport.navigationBarSize =
      viewport.orientation === 'landscape'
        ? viewport.displaySize.width -
          ((capabilities['appium:viewportRect'] ?? capabilities.viewportRect).left +
            (capabilities['appium:viewportRect'] ?? capabilities.viewportRect).width)
        : viewport.displaySize.height -
          ((capabilities['appium:viewportRect'] ?? capabilities.viewportRect).top +
            (capabilities['appium:viewportRect'] ?? capabilities.viewportRect).height)
  }

  return viewport
}

function isW3C(capabilities: Capabilities) {
  const isW3C = Boolean(
    (capabilities.platformName || capabilities.browserVersion) &&
      (capabilities.platformVersion || capabilities.hasOwnProperty('setWindowRect')),
  )
  return isW3C || isAppium(capabilities)
}

function isAppium(capabilities: Capabilities) {
  return (
    Boolean(capabilities.automationName || capabilities.deviceName || capabilities.appiumVersion) ||
    Object.keys(capabilities).some(cap => cap.startsWith('appium:'))
  )
}

function isChrome(capabilities: Capabilities) {
  return Boolean(capabilities.chrome || capabilities['goog:chromeOptions'])
}

function _isFirefox(capabilities: Capabilities) {
  return capabilities.browserName === 'firefox' || Object.keys(capabilities).some(cap => cap.startsWith('moz:'))
}

function isMobile(capabilities: Capabilities) {
  return (
    capabilities.browserName === '' ||
    ['ipad', 'iphone', 'android'].includes(capabilities.browserName?.toLowerCase() ?? '') ||
    isAppium(capabilities)
  )
}

function isIOS(capabilities: Capabilities) {
  return /iOS/i.test(capabilities.platformName) || /(iPad|iPhone)/i.test(capabilities.deviceName)
}

function isAndroid(capabilities: Capabilities) {
  return /Android/i.test(capabilities.platformName) || /Android/i.test(capabilities.browserName)
}

function extractDisplaySize(capabilities: Capabilities): Size | undefined {
  const deviceScreenSize = capabilities['appium:deviceScreenSize'] ?? capabilities.deviceScreenSize
  if (!deviceScreenSize) return undefined
  const [width, height] = deviceScreenSize.split('x')
  if (Number.isNaN(Number(width)) || Number.isNaN(Number(height))) return undefined
  return {width: Number(width), height: Number(height)}
}
