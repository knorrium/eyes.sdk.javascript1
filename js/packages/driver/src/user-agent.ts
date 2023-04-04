import type {UserAgent, Environment} from './types'
import * as utils from '@applitools/utils'

const MAJOR_MINOR = '(\\d+)(?:[_.](\\d+))?'

const PLATFORM_REGEXES = [
  new RegExp(`(?:(Windows NT) ${MAJOR_MINOR})`),
  new RegExp('(?:(Windows XP))'),
  new RegExp('(?:(Windows 2000))'),
  new RegExp('(?:(Windows NT))'),
  new RegExp('(?:(Windows))'),
  new RegExp(`(?:(Mac OS X) ${MAJOR_MINOR})`),
  new RegExp(`(?:(Android) ${MAJOR_MINOR})`),
  new RegExp(`(?:(CPU(?: i[a-zA-Z]+)? OS) ${MAJOR_MINOR})`),
  new RegExp('(?:(Mac OS X))'),
  new RegExp('(?:(Mac_PowerPC))'),
  new RegExp('(?:(Linux))'),
  new RegExp('(?:(CrOS))'),
  new RegExp('(?:(SymbOS))'),
]

const BROWSER_REGEXPES = [
  new RegExp(`(?:(Opera)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Edg)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Edge)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Chrome)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Safari)/${MAJOR_MINOR})`),
  new RegExp(`(?:(Firefox)/${MAJOR_MINOR})`),
  new RegExp(`(?:MS(IE) ${MAJOR_MINOR})`),
]

const HIDDEN_IE_REGEX = new RegExp(`(?:rv:${MAJOR_MINOR}\\) like Gecko)`)

const BROWSER_VERSION_REGEX = new RegExp(`(?:Version/${MAJOR_MINOR})`)

const WINDOWS_VERSIONS = {
  '0.1.0': '7',
  '0.2.0': '8',
  '0.3.0': '8.1',
  '10.0.0': '10',
  '15.0.0': '11',
}

export function extractUserAgentEnvironment(userAgent: UserAgent): Environment {
  let userAgentLegacy: string, userAgentObject: Exclude<UserAgent, string> | undefined
  if (utils.types.isString(userAgent)) {
    userAgentLegacy = userAgent.trim()
  } else {
    userAgentLegacy = userAgent.legacy.trim()
    userAgentObject = userAgent
  }
  const userAgentLegacyEnvironment = {
    ...extractUserAgentLegacyPlatform(userAgentLegacy),
    ...extractUserAgentLegacyBrowser(userAgentLegacy),
  }
  const userAgentEnvironment = userAgentObject && extractUserAgentObjectEnvironment(userAgentObject)

  const environment = {...userAgentEnvironment}
  environment.platformName ??= userAgentLegacyEnvironment.platformName
  environment.platformVersion ??= userAgentLegacyEnvironment.platformVersion
  environment.browserName = userAgentLegacyEnvironment.browserName ?? environment.browserName
  environment.browserVersion = userAgentLegacyEnvironment.browserVersion ?? environment.browserVersion

  return environment
}

function extractUserAgentLegacyPlatform(userAgent: string): {platformName: string; platformVersion?: string} {
  const platformRegExp = PLATFORM_REGEXES.find(regexp => regexp.test(userAgent))

  if (!platformRegExp) return {platformName: 'Unknown'}

  const [_, platformName, platformMajorVersion, platformMinorVersion] = platformRegExp.exec(userAgent)!

  if (platformName.startsWith('CPU')) {
    return {platformName: 'iOS', platformVersion: platformMajorVersion}
  } else if (platformName === 'Windows 2000' || platformName === 'Windows XP') {
    return {platformName: 'Windows', platformVersion: '5'}
  } else if (platformName === 'Windows NT') {
    const result = {platformName: 'Windows', platformVersion: platformMajorVersion}
    if (!platformMajorVersion) {
      result.platformVersion = '4'
    } else if (platformMajorVersion === '6' && platformMinorVersion === '1') {
      result.platformVersion = '7'
    } else if (platformMajorVersion === '6' && (platformMinorVersion === '2' || platformMinorVersion === '3')) {
      result.platformVersion = '8'
    }
    return result
  } else if (platformName === 'Mac_PowerPC') {
    return {platformName: 'Macintosh', platformVersion: platformMajorVersion}
  } else if (platformName === 'CrOS') {
    return {platformName: 'Chrome OS', platformVersion: platformMajorVersion}
  } else {
    return {platformName, platformVersion: platformMajorVersion}
  }
}

function extractUserAgentLegacyBrowser(userAgent: string): {browserName: string; browserVersion?: string} {
  const browserRegExp = BROWSER_REGEXPES.find(regexp => regexp.test(userAgent))
  if (!browserRegExp) {
    if (HIDDEN_IE_REGEX.test(userAgent)) {
      const [_, browserVersion] = HIDDEN_IE_REGEX.exec(userAgent)!
      return {browserName: 'IE', browserVersion}
    } else {
      return {browserName: 'Unknown'}
    }
  }

  const [_, browserName, browserVersion] = browserRegExp.exec(userAgent)!
  const result = {browserName, browserVersion}

  if (result.browserName === 'Edg') result.browserName = 'Edge'
  if (BROWSER_VERSION_REGEX.test(userAgent)) {
    const [_, browserVersion] = BROWSER_VERSION_REGEX.exec(userAgent)!
    result.browserVersion = browserVersion
  }

  return result
}

function extractUserAgentObjectEnvironment(userAgent: Exclude<UserAgent, string>): Environment {
  const chromiumBrand = userAgent.brands?.find(brand => /Chromium/i.test(brand.brand))
  const browserBrand =
    userAgent.brands?.find(brand => brand !== chromiumBrand && !/Not.?A.?Brand/i.test(brand.brand)) ?? chromiumBrand

  const environment: Environment = {
    browserName: browserBrand?.brand,
    browserVersion: browserBrand?.version,
    platformName: userAgent.platform || undefined,
    platformVersion: userAgent.platformVersion || undefined,
    deviceName: userAgent.model || undefined,
    isMobile: userAgent.mobile,
    isChromium: Boolean(chromiumBrand),
  }

  if (environment.platformName === 'Windows') {
    environment.platformVersion = WINDOWS_VERSIONS[environment.platformVersion as keyof typeof WINDOWS_VERSIONS]
  } else if (environment.platformName === 'macOS') {
    environment.platformName = 'Mac OS X'
    environment.platformVersion = environment.platformVersion?.split(/[._]/, 2).join('.')
  }

  return environment
}
