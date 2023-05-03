import type {UserAgent, Environment} from './types'
import * as utils from '@applitools/utils'

const majorMinorRegexpString = '(?<majorVersion>[^ .;_)]+)[_.;](?<minorVersion>[^ .;_)]*)'
const platformRegexpMapping = [
  ['Windows', new RegExp(`Windows(?:(?: NT)? ${majorMinorRegexpString}?)?`)],
  ['iOS', new RegExp(`CPU(?: i[a-zA-Z]+)? OS ${majorMinorRegexpString}`)],
  ['Mac OS X', new RegExp(`Mac OS X(?: ${majorMinorRegexpString})?`)],
  ['Android', new RegExp(`Android ${majorMinorRegexpString}`)],
  ['Macintosh', new RegExp(`Mac_PowerPC`)],
  ['Linux', new RegExp(`Linux`)],
  ['Chrome OS', new RegExp(`CrOS`)],
  ['SymbOS', new RegExp(`SymbOS`)],
] as [string, RegExp][]
const browserRegexpMapping = [
  ['IE', new RegExp(`rv:${majorMinorRegexpString}\\) like Gecko`)],
  ['IE', new RegExp(`MSIE ${majorMinorRegexpString}`)],
  ['Electron', new RegExp(`Electron/${majorMinorRegexpString}`)],
  ['Opera', new RegExp(`Opera/${majorMinorRegexpString}`)],
  ['Edge', new RegExp(`(?:Edg|Edge)/${majorMinorRegexpString}`)],
  ['Chrome', new RegExp(`Chrome/${majorMinorRegexpString}`)],
  ['Safari', new RegExp(`Safari/${majorMinorRegexpString}`)],
  ['Firefox', new RegExp(`Firefox/${majorMinorRegexpString}`)],
] as [string, RegExp][]
const browserVersionRegexp = new RegExp(`(?:Version/${majorMinorRegexpString})`)

const windowsVersionsMapping = {
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

  return {
    ...userAgentEnvironment,
    platformName: userAgentEnvironment?.platformName ?? userAgentLegacyEnvironment.platformName,
    platformVersion: userAgentEnvironment?.platformVersion ?? userAgentLegacyEnvironment.platformVersion,
    browserName: userAgentLegacyEnvironment.browserName ?? userAgentEnvironment?.browserName,
    browserVersion: userAgentLegacyEnvironment.browserVersion ?? userAgentEnvironment?.browserVersion,
    isReliable: !!(userAgentEnvironment?.platformName && userAgentEnvironment?.platformVersion),
  }
}

function extractUserAgentLegacyPlatform(userAgent: string): {platformName: string; platformVersion?: string} {
  let info: {platformName: string; majorVersion?: string; minorVersion?: string} | undefined
  for (const [platformName, regexp] of platformRegexpMapping) {
    const match = regexp.exec(userAgent)
    if (match) {
      info = {platformName, ...match.groups}
      break
    }
  }

  if (!info) return {platformName: 'Unknown'}

  if (info.platformName === 'Macintosh' || info.platformName === 'Chrome OS') {
    info.minorVersion = undefined
  } else if (info.platformName === 'Windows') {
    if (info.majorVersion === 'XP') {
      info.majorVersion = '5'
      info.minorVersion = '1'
    } else if (info.majorVersion === '6' && info.minorVersion === '1') {
      info.majorVersion = '7'
      info.minorVersion = undefined
    } else if (info.majorVersion === '6' && info.minorVersion === '2') {
      info.majorVersion = '8'
      info.minorVersion = undefined
    } else if (info.majorVersion === '6' && info.minorVersion === '3') {
      info.majorVersion = '8'
      info.minorVersion = '1'
    } else if (info.majorVersion === '10') {
      info.minorVersion = undefined
    } else {
      info.majorVersion = undefined
      info.minorVersion = undefined
    }
  }

  return {
    platformName: info.platformName,
    platformVersion: info.minorVersion ? `${info.majorVersion}.${info.minorVersion}` : info.majorVersion,
  }
}

function extractUserAgentLegacyBrowser(userAgent: string): {browserName: string; browserVersion?: string} {
  let info: {browserName: string; majorVersion?: string; minorVersion?: string} | undefined
  for (const [browserName, browserRegexp] of browserRegexpMapping) {
    const browserMatch = browserRegexp.exec(userAgent)
    if (browserMatch) {
      info = {browserName, ...browserMatch.groups}
      const versionMatch = browserVersionRegexp.exec(userAgent)
      if (versionMatch) info = {...info, ...versionMatch.groups}
      break
    }
  }

  if (!info) return {browserName: 'Unknown'}

  return {
    browserName: info.browserName,
    browserVersion: info.minorVersion ? `${info.majorVersion}.${info.minorVersion}` : info.majorVersion,
  }
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
    environment.platformVersion =
      windowsVersionsMapping[environment.platformVersion as keyof typeof windowsVersionsMapping]
  } else if (environment.platformName === 'macOS') {
    environment.platformName = 'Mac OS X'
    environment.platformVersion = environment.platformVersion?.split(/[._]/, 2).join('.')
  }

  return environment
}
