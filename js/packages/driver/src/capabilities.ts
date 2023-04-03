import type {Size} from '@applitools/utils'
import type {Capabilities, Environment, Viewport} from './types'

export function extractCapabilitiesEnvironment(capabilities: Capabilities): Partial<Environment> {
  if (capabilities.capabilities) capabilities = capabilities.capabilities as Capabilities

  const environment: Environment = {
    browserName:
      !capabilities.app && !capabilities.bundleId
        ? (capabilities.browserName ?? capabilities.desired?.browserName) || undefined
        : undefined,
    browserVersion: (capabilities.browserVersion ?? capabilities.version) || undefined,
    platformName:
      (capabilities.platformName ?? capabilities.platform ?? capabilities.desired?.platformName) || undefined,
    platformVersion: capabilities.platformVersion || undefined,
    isW3C: isW3C(capabilities),
    isMobile: isMobile(capabilities),
    isChrome: isChrome(capabilities),
    isECClient: Boolean(capabilities['applitools:isECClient']),
  }

  if (environment?.isMobile) {
    environment.deviceName = (capabilities.desired?.deviceName ?? capabilities.deviceName) || undefined
    environment.isIOS = isIOS(capabilities)
    environment.isAndroid = isAndroid(capabilities)
    if (!environment.browserName) {
      environment.isNative = true
    } else if (environment.isIOS && !/mobilesafari/i.test(capabilities.CFBundleIdentifier)) {
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
    orientation: (capabilities.deviceOrientation ?? capabilities.orientation)?.toLowerCase(),
    pixelRatio: capabilities.pixelRatio,
    statusBarSize: capabilities.statBarHeight ?? capabilities.viewportRect?.top,
  }

  if (viewport.displaySize && viewport.orientation && capabilities.viewportRect) {
    viewport.navigationBarSize =
      viewport.orientation === 'landscape'
        ? viewport.displaySize.width - (capabilities.viewportRect.left + capabilities.viewportRect.width)
        : viewport.displaySize.height - (capabilities.viewportRect.top + capabilities.viewportRect.height)
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
  if (!capabilities.deviceScreenSize) return undefined
  const [width, height] = capabilities.deviceScreenSize.split('x')
  if (Number.isNaN(Number(width)) || Number.isNaN(Number(height))) return undefined
  return {width: Number(width), height: Number(height)}
}
