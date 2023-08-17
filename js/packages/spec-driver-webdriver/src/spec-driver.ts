import type {Size, Region} from '@applitools/utils'
import type {SpecType, SpecDriver as BaseSpecDriver, CommonSelector, Cookie, DriverInfo} from '@applitools/driver'
import type * as WD from 'webdriver' assert {'resolution-mode': 'require'}
import {parse as urlToHttpOptions} from 'url'
import createHttpProxyAgent from 'http-proxy-agent'
import createHttpsProxyAgent from 'https-proxy-agent'
import http from 'http'
import https from 'https'
import * as utils from '@applitools/utils'

type ApplitoolsBrand = {__applitoolsBrand?: never}

export type StaticDriver<TOriginalDriver = unknown> = {
  sessionId: string
  serverUrl: string
  capabilities: Record<string, any>
  proxy?: {url: string; username?: string; password?: string}
  original?: TOriginalDriver
}
export type StaticElement = {elementId: string}
export type SecondarySpecType = SpecType<StaticDriver, never, StaticElement, never, never>

export type Driver<TOriginalDriver = unknown> = WD.Client & {original: TOriginalDriver} & ApplitoolsBrand
export type Element = ({'element-6066-11e4-a52e-4f735466cecf': string} | {ELEMENT: string}) & ApplitoolsBrand
export type ShadowRoot = {'shadow-6066-11e4-a52e-4f735466cecf': string} & ApplitoolsBrand
export type Selector = {using: string; value: string} & ApplitoolsBrand
export type PrimarySpecType = SpecType<Driver, Driver, Element, Selector, SecondarySpecType>
export type SpecDriver = BaseSpecDriver<PrimarySpecType>

const LEGACY_ELEMENT_ID = 'ELEMENT'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'
const SHADOW_ROOT_ID = 'shadow-6066-11e4-a52e-4f735466cecf'

const W3C_CAPABILITIES = ['platformName', 'platformVersion']
const W3C_SECONDARY_CAPABILITIES = ['pageLoadStrategy']
const W3C_SAFARI_CAPABILITIES = ['browserVersion', 'setWindowRect']
const APPIUM_CAPABILITIES = ['appiumVersion', 'deviceType', 'deviceOrientation', 'deviceName', 'automationName']
const LEGACY_APPIUM_CAPABILITIES = ['appium-version', 'device-type', 'device-orientation']
const CHROME_CAPABILITIES = ['chrome', 'goog:chromeOptions']
const MOBILE_BROWSER_NAMES = ['ipad', 'iphone', 'android']
const ANDROID_PLATFORM_NAME = 'android'
const ANDROID_AUTOMATION_NAME = 'uiautomator2'

function extractElementId(element: Element): string {
  return (
    (element as {'element-6066-11e4-a52e-4f735466cecf': string})[ELEMENT_ID] ??
    (element as {ELEMENT: string})[LEGACY_ELEMENT_ID]
  )
}
function extractShadowRootId(shadowRoot: ShadowRoot): string {
  return shadowRoot[SHADOW_ROOT_ID]
}
function extractEnvironment(capabilities: Record<string, any>) {
  const isAppium =
    APPIUM_CAPABILITIES.some(capability => capabilities.hasOwnProperty(capability)) ||
    APPIUM_CAPABILITIES.some(capability => capabilities.hasOwnProperty(`appium:${capability}`))
  const isChrome = CHROME_CAPABILITIES.includes(capabilities.browserName?.toLowerCase())
  const isW3C =
    isAppium ||
    W3C_SECONDARY_CAPABILITIES.every(capability => capabilities.hasOwnProperty(capability)) ||
    W3C_CAPABILITIES.every(capability => capabilities.hasOwnProperty(capability)) ||
    W3C_SAFARI_CAPABILITIES.every(capability => capabilities.hasOwnProperty(capability))
  const isMobile =
    capabilities.browserName === '' ||
    isAppium ||
    LEGACY_APPIUM_CAPABILITIES.some(capability => capabilities.hasOwnProperty(capability)) ||
    MOBILE_BROWSER_NAMES.includes(capabilities.browserName?.toLowerCase())
  const isAndroid =
    capabilities.platformName?.toLowerCase() === ANDROID_PLATFORM_NAME ||
    capabilities.automationName?.toLowerCase() === ANDROID_AUTOMATION_NAME

  return {
    isAndroid,
    isChrome,
    isMobile,
    isW3C,
  }
}
function command(method: string, url: string, body: any) {
  if (getFrameworkMajorVersion() < 8) {
    let commandPath
    try {
      commandPath = require.resolve('webdriver/build/command', {paths: [`${process.cwd()}/node_modules`]})
    } catch {
      commandPath = 'webdriver/build/command'
    }
    const {default: command} = require(commandPath)
    return command(method, url, body)
  } else {
    let frameworkPath
    try {
      frameworkPath = require.resolve('webdriver', {paths: [`${process.cwd()}/node_modules`]})
    } catch {
      frameworkPath = 'webdriver'
    }
    const {command} = require(frameworkPath)
    return command(method, url, body)
  }
}
function getFrameworkMajorVersion(): number {
  let version
  try {
    version = require(require.resolve('webdriver/package.json', {paths: [`${process.cwd()}/node_modules`]})).version
  } catch {
    version = require('webdriver/package.json').version
  }
  return Number.parseInt(version)
}
function getWebDriver() {
  let frameworkPath
  try {
    frameworkPath = require.resolve('webdriver', {paths: [`${process.cwd()}/node_modules`]})
  } catch {
    frameworkPath = 'webdriver'
  }

  return getFrameworkMajorVersion() < 8 ? require(frameworkPath).default : require(frameworkPath)
}

export function isDriver(driver: any): driver is Driver {
  if (!driver) return false
  return utils.types.instanceOf<Driver>(driver, 'Browser')
}
export function isSecondaryDriver(driver: any): driver is StaticDriver {
  if (!driver) return false
  return utils.types.has(driver, ['sessionId', 'serverUrl'])
}
export function isElement(element: any): element is Element {
  if (!element) return false
  return !!extractElementId(element)
}
export function isSecondaryElement(element: any): element is StaticElement {
  if (!element) return false
  return !!element.elementId
}
export function isShadowRoot(shadowRoot: any): shadowRoot is ShadowRoot {
  if (!shadowRoot) return false
  return !!extractShadowRootId(shadowRoot)
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return utils.types.has(selector, ['using', 'value'])
}
export function isEqualElements(_driver: Driver, element1: Element, element2: Element): boolean {
  if (!element1 || !element2) return false
  const elementId1 = extractElementId(element1)
  const elementId2 = extractElementId(element2)
  return elementId1 === elementId2
}
export function isStaleElementError(error: any): boolean {
  if (!error) return false
  const errOrResult = error.originalError || error
  return errOrResult instanceof Error && errOrResult.name === 'stale element reference'
}
export function toDriver<TOriginalDriver = never>(
  driver: StaticDriver<TOriginalDriver>,
): Driver<TOriginalDriver> | Promise<Driver<TOriginalDriver>> {
  if (!utils.types.has(driver, ['sessionId', 'serverUrl'])) return driver

  const url = new URL(driver.serverUrl)
  const environment = extractEnvironment(driver.capabilities)
  const options: WD.AttachOptions = {
    sessionId: driver.sessionId,
    protocol: url.protocol ? url.protocol.replace(/:$/, '') : undefined,
    hostname: url.hostname,
    port: Number(url.port) || undefined,
    path: url.pathname,
    capabilities: driver.capabilities,
    logLevel: 'silent',
    ...environment,
  }
  if (!options.port) {
    if (options.protocol === 'http') options.port = 80
    if (options.protocol === 'https') options.port = 443
  }
  if (driver.proxy?.url) {
    const proxyUrl = new URL(driver.proxy.url)
    proxyUrl.username = driver.proxy.username ?? proxyUrl.username
    proxyUrl.password = driver.proxy.password ?? proxyUrl.password
    const proxyOptions = {...urlToHttpOptions(proxyUrl.href), rejectUnauthorized: false}
    const httpAgent = createHttpProxyAgent(proxyOptions)
    const httpsAgent = createHttpsProxyAgent(proxyOptions)
    httpsAgent.callback = utils.general.wrap(httpsAgent.callback.bind(httpsAgent), (fn, request, options, ...rest) => {
      return fn(request, {...options, rejectUnauthorized: false} as typeof options, ...rest)
    })
    options.agent = {http: httpAgent, https: httpsAgent}
  } else {
    const httpAgent = http.globalAgent
    const httpsAgent = new https.Agent({rejectUnauthorized: false})
    options.agent = {http: httpAgent, https: httpsAgent}
  }

  const WebDriver = getWebDriver()
  const attachedDriver = WebDriver.attachToSession(options, undefined, {
    _getWindowSize: {
      value: command('GET', '/session/:sessionId/window/current/size', {
        command: '_getWindowSize',
        description: '',
        ref: '',
        parameters: [],
      }),
    },
    _setWindowSize: {
      value: command('POST', '/session/:sessionId/window/current/size', {
        command: '_setWindowSize',
        parameters: [
          {name: 'width', type: 'number', required: true, description: ''},
          {name: 'height', type: 'number', required: true, description: ''},
        ],
        description: '',
        ref: '',
      }),
    },
    setWindowPosition: {
      value: command('POST', '/session/:sessionId/window/current/position', {
        command: 'setWindowPosition',
        parameters: [
          {name: 'x', type: 'number', required: true, description: ''},
          {name: 'y', type: 'number', required: true, description: ''},
        ],
        description: '',
        ref: '',
      }),
    },
  })
  attachedDriver.original = driver.original
  return attachedDriver
}
export function toElement(element: StaticElement): Element {
  const elementId = utils.types.has(element, 'elementId') ? element.elementId : extractElementId(element)
  return {[ELEMENT_ID]: elementId, [LEGACY_ELEMENT_ID]: elementId}
}
export function toSelector(selector: CommonSelector<Selector>): Selector {
  if (utils.types.has(selector, 'selector')) {
    if (utils.types.has(selector, 'type') && selector.type && utils.types.isString(selector.selector)) {
      return {using: selector.type === 'css' ? 'css selector' : selector.type, value: selector.selector}
    } else if (isSelector(selector.selector)) {
      return selector.selector
    } else {
      selector = selector.selector
    }
  }
  if (utils.types.isString(selector)) {
    return {using: 'css selector', value: selector}
  }
  return selector
}
export function toSimpleCommonSelector(selector: Selector): CommonSelector {
  if (utils.types.has(selector, ['using', 'value'])) {
    return {type: selector.using === 'css selector' ? 'css' : selector.using, selector: selector.value}
  }
  return selector
}
export async function executeScript(driver: Driver, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  script = utils.types.isFunction(script) ? `return (${script}).apply(null, arguments)` : script
  return driver.executeScript(script, [arg])
}
export async function findElement(
  driver: Driver,
  selector: Selector,
  parent?: Element | ShadowRoot,
): Promise<Element | null> {
  const parentId = parent ? (isShadowRoot(parent) ? extractShadowRootId(parent) : extractElementId(parent)) : null
  try {
    const element = parentId
      ? await driver.findElementFromElement(parentId, selector.using, selector.value)
      : await driver.findElement(selector.using, selector.value)
    return isElement(element) ? element : null
  } catch (error: any) {
    if (
      /element could not be located/i.test(error.message) ||
      /cannot locate an element/i.test(error.message) ||
      /wasn\'t found/i.test(error.message)
    ) {
      return null
    }
    throw error
  }
}
export async function findElements(
  driver: Driver,
  selector: Selector,
  parent?: Element | ShadowRoot,
): Promise<Element[]> {
  const parentId = parent ? (isShadowRoot(parent) ? extractShadowRootId(parent) : extractElementId(parent)) : null
  return parentId
    ? await driver.findElementsFromElement(parentId, selector.using, selector.value)
    : await driver.findElements(selector.using, selector.value)
}
export async function getElementRegion(driver: Driver, element: Element): Promise<Region> {
  return driver.getElementRect(extractElementId(element))
}
export async function getElementAttribute(driver: Driver, element: Element, attr: string): Promise<string> {
  return driver.getElementAttribute(extractElementId(element), attr)
}
export async function setElementText(driver: Driver, element: Element, text: string): Promise<void> {
  await driver.elementClear(extractElementId(element))
  await driver.elementSendKeys(extractElementId(element), text)
}
export async function getElementText(driver: Driver, element: Element): Promise<string> {
  return driver.getElementText(extractElementId(element))
}
export async function hover(driver: Driver, element: Element): Promise<void> {
  if (!driver.isW3C) return await driver.moveToElement(extractElementId(element))
  await driver.performActions([
    {
      type: 'pointer',
      id: 'mouse',
      parameters: {pointerType: 'mouse'},
      actions: [{type: 'pointerMove', duration: 0, origin: element, x: 0, y: 0}],
    },
  ])
}
export async function click(driver: Driver, element: Element): Promise<void> {
  await driver.elementClick(extractElementId(element))
}
export async function mainContext(driver: Driver): Promise<Driver> {
  await driver.switchToFrame(null)
  return driver
}
export async function parentContext(driver: Driver): Promise<Driver> {
  await driver.switchToParentFrame()
  return driver
}
export async function childContext(driver: Driver, element: Element): Promise<Driver> {
  await driver.switchToFrame(element)
  return driver
}
export async function getDriverInfo(driver: Driver): Promise<DriverInfo> {
  return {sessionId: driver.sessionId}
}
export async function getCapabilities(driver: Driver): Promise<Record<string, any>> {
  try {
    const capabilities = await driver.getSession?.()
    return utils.types.isObject(capabilities) ? capabilities : driver.capabilities
  } catch (error: any) {
    if (/Cannot call non W3C standard command while in W3C mode/i.test(error.message)) return driver.capabilities
    throw new Error(`Unable to retrieve capabilities due to an error. The original error is ${error.message}`)
  }
}
export async function getWindowSize(driver: Driver): Promise<Size> {
  try {
    const rect = await driver.getWindowRect()
    return {width: rect.width, height: rect.height}
  } catch {
    return driver._getWindowSize() as Promise<Size>
  }
}
export async function setWindowSize(driver: Driver, size: Size): Promise<void> {
  try {
    await driver.setWindowRect(0, 0, size.width, size.height)
  } catch {
    await driver.setWindowPosition(0, 0)
    await driver._setWindowSize(size.width, size.height)
  }
}
export async function setViewportSize(driver: Driver, size: Size): Promise<void> {
  await driver.sendCommandAndGetResult('Emulation.setDeviceMetricsOverride', {
    ...size,
    deviceScaleFactor: 0,
    mobile: false,
  })
}
export async function getOrientation(browser: Driver): Promise<'portrait' | 'landscape'> {
  const orientation = await browser.getOrientation()
  return orientation.toLowerCase() as 'portrait' | 'landscape'
}
export async function setOrientation(browser: Driver, orientation: 'portrait' | 'landscape'): Promise<void> {
  return await browser.setOrientation(orientation)
}
export async function getSystemBars(browser: Driver): Promise<{
  statusBar: {visible: boolean; x: number; y: number; height: number; width: number}
  navigationBar: {visible: boolean; x: number; y: number; height: number; width: number}
}> {
  return browser.getSystemBars() as any
}
export async function getCookies(driver: Driver, context?: boolean): Promise<Cookie[]> {
  if (context) return driver.getAllCookies()

  const response = await driver.sendCommandAndGetResult('Network.getAllCookies', {})
  const cookies = response.cookies

  return cookies.map((cookie: any) => {
    const copy = {...cookie, expiry: cookie.expires}
    delete copy.expires
    delete copy.size
    delete copy.priority
    delete copy.session
    delete copy.sameParty
    delete copy.sourceScheme
    delete copy.sourcePort
    return copy
  })
}
export async function getTitle(driver: Driver): Promise<string> {
  return driver.getTitle()
}
export async function getUrl(driver: Driver): Promise<string> {
  return driver.getUrl()
}
export async function visit(driver: Driver, url: string): Promise<void> {
  await driver.navigateTo(url)
}
export async function performAction(driver: Driver, steps: any[]): Promise<void> {
  return driver.touchPerform(steps.map(({action, ...options}) => ({action, options})))
}
export async function takeScreenshot(driver: Driver): Promise<string> {
  return driver.takeScreenshot()
}
export async function getCurrentWorld(driver: Driver): Promise<string> {
  const world = await driver.getContext()
  return utils.types.isString(world) ? world : world.id
}
export async function getWorlds(driver: Driver): Promise<string[]> {
  const worlds = await driver.getContexts()
  return worlds.map(world => (utils.types.isString(world) ? world : world.id))
}
export async function switchWorld(driver: Driver, id: string): Promise<void> {
  await driver.switchContext(id)
}

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
/*
 * Spawn a browser with a given configuration (INTERNAL USE ONLY)
 *
 * NOTE:
 * This function is intended for internal use only. As a result it relies on some dev dependencies.
 * When wiring the spec-driver up to an SDK and calling this function, if you don't have the same dev deps
 * installed in the SDK, then this function will error.
 */
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
  const WebDriver = getWebDriver()

  const parseEnv = require('@applitools/test-utils/src/parse-env')
  const {
    browser = '',
    capabilities,
    url,
    proxy,
    configurable = true,
    args = [],
    headless,
    logLevel = 'silent',
  } = parseEnv(env)

  const options: any = {
    capabilities: {browserName: browser, ...capabilities},
    logLevel,
  }
  options.protocol = url.protocol ? url.protocol.replace(/:$/, '') : undefined
  options.hostname = url.hostname
  if (url.port) options.port = Number(url.port)
  else if (options.protocol === 'http') options.port = 80
  else if (options.protocol === 'https') options.port = 443
  options.path = url.pathname
  if (configurable) {
    const browserOptionsName = browserOptionsNames[browser || options.capabilities.browserName]
    if (browserOptionsName) {
      const browserOptions = options.capabilities[browserOptionsName] || {}
      browserOptions.args = [...(browserOptions.args || []), ...args]
      if (headless) browserOptions.args.push('headless')
      options.capabilities[browserOptionsName] = browserOptions
    }
  }
  if (proxy) {
    options.capabilities.proxy = {
      proxyType: 'manual',
      httpProxy: proxy.http || proxy.server,
      sslProxy: proxy.https || proxy.server,
      ftpProxy: proxy.ftp,
      noProxy: proxy.bypass.join(','),
    }
  }
  options.agent = {https: require('https').Agent({rejectUnauthorized: false})}
  const driver = await WebDriver.newSession(options)
  return [driver, () => driver.deleteSession()]
}
