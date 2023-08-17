/* eslint @typescript-eslint/ban-types: ["error", {"types": {"Function": false}}] */
import type {SpecType, CommonSelector} from '@applitools/driver'
import type * as Selenium from 'selenium-webdriver'
import type * as Nightwatch from 'nightwatch'
import * as spec from '@applitools/spec-driver-webdriver'
import * as utils from '@applitools/utils'

export * from '@applitools/spec-driver-webdriver'

type ApplitoolsBrand = {__applitoolsBrand?: never}

export type NWDriver = Nightwatch.NightwatchBrowser & ApplitoolsBrand
export type NWElement = (spec.Element | Selenium.WebElement | Nightwatch.NightwatchTypedCallbackResult<Element>) &
  ApplitoolsBrand
export type NWShadowRoot = ({id_: string} | spec.ShadowRoot) & ApplitoolsBrand
export type NWSelector = (
  | string
  | Nightwatch.ElementProperties
  | Exclude<Selenium.Locator, Function>
  | ((webdriver: Selenium.WebDriver) => Promise<any>)
  | {using: string; value: string}
) &
  ApplitoolsBrand
export type NWSpecType = SpecType<NWDriver, NWDriver, NWElement, NWSelector, never>

export type SecondaryDriver = (NWDriver | spec.StaticDriver) & ApplitoolsBrand
export type SecondaryElement = (Selenium.WebElement | Nightwatch.NightwatchTypedCallbackResult<Element>) &
  ApplitoolsBrand
export type SecondarySpecType = SpecType<SecondaryDriver, never, SecondaryElement, never, never>

export type Driver = spec.Driver<NWDriver> & ApplitoolsBrand
export type Element = spec.Element & ApplitoolsBrand
export type ShadowRoot = spec.ShadowRoot & ApplitoolsBrand
export type Selector = NWSelector & ApplitoolsBrand
export type PrimarySpecType = SpecType<Driver, Driver, Element, Selector, SecondarySpecType>

const byHash = ['className', 'css', 'id', 'js', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath'] as const
function isByHashSelector(selector: any): selector is Selenium.ByHash {
  return byHash.includes(Object.keys(selector)[0] as (typeof byHash)[number])
}
const XPATH_SELECTOR_START = ['/', '(', '../', './', '*/']
function isXpathSelector(selector: string): boolean {
  return XPATH_SELECTOR_START.some(start => selector.startsWith(start))
}

export function isSecondaryDriver(driver: any): driver is SecondaryDriver {
  return utils.types.instanceOf(driver, 'NightwatchAPI') || spec.isSecondaryDriver(driver)
}
export function isSecondaryElement(element: any): element is SecondaryElement {
  return (
    (utils.types.has(element, 'value') && spec.isElement(element.value)) ||
    utils.types.has(element, 'webElement') ||
    utils.types.instanceOf(element, 'WebElement')
  )
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return (
    spec.isSelector(selector) ||
    utils.types.isString(selector) ||
    (utils.types.has(selector, 'selector') && utils.types.isString(selector.selector)) ||
    isByHashSelector(selector) ||
    utils.types.isFunction(selector) ||
    utils.types.instanceOf<Selenium.RelativeBy>(selector, 'RelativeBy')
  )
}
export function toDriver(driver: SecondaryDriver): Driver | Promise<Driver> {
  if (spec.isDriver(driver)) return driver as Driver
  if (spec.isSecondaryDriver(driver)) return spec.toDriver(driver) as Driver | Promise<Driver>
  const selenium = (driver.options as any).selenium
  const webdriver = (driver.options as any).webdriver
  const ssl = selenium?.ssl ?? webdriver?.ssl
  const hostname = selenium?.host ?? webdriver?.host
  const port = selenium?.port ?? webdriver?.port
  const path = selenium?.default_path_prefix ?? webdriver?.default_path_prefix
  return spec.toDriver({
    sessionId: driver.sessionId,
    serverUrl: `http${ssl ? 's' : ''}://${hostname ?? 'localhost'}${port ? `:${port}` : ''}${path}`,
    capabilities: (driver as any).capabilities,
    original: driver,
  })
}
export function toElement(element: SecondaryElement): Element | Promise<Element> {
  if (utils.types.has(element, 'value')) {
    return element.value
  } else if (utils.types.instanceOf(element, 'WebElement')) {
    return element.getId().then(elementId => spec.toElement({elementId}))
  }
  return element
}
export function toSelector(selector: CommonSelector<Selector>): Selector {
  if (utils.types.isString(selector)) {
    return {locateStrategy: isXpathSelector(selector) ? 'xpath' : 'css selector', selector}
  } else if (utils.types.has(selector, 'selector')) {
    if (!utils.types.isString(selector.selector)) return selector.selector
    if (!utils.types.has(selector, 'type')) {
      return {
        locateStrategy: isXpathSelector(selector.selector) ? 'xpath' : 'css selector',
        selector: selector.selector,
      }
    }
    if (selector.type === 'css') return {locateStrategy: 'css selector', selector: selector.selector}
    else return {locateStrategy: selector.type as Nightwatch.LocateStrategy, selector: selector.selector}
  }
  return selector
}
export function toSimpleCommonSelector(selector: Selector): CommonSelector | null {
  if (utils.types.instanceOf<Selenium.RelativeBy>(selector, 'RelativeBy') || utils.types.isFunction(selector)) {
    return null
  } else if (utils.types.isString(selector)) {
    return {selector}
  } else if (isByHashSelector(selector)) {
    const [[how, what]] = Object.entries(selector) as [[(typeof byHash)[number], string]]
    if (how === 'js') return null
    const Selenium = require('selenium-webdriver')
    selector = Selenium.By[how](what) as Selenium.By
  }
  if (utils.types.has(selector, ['using', 'value'])) {
    selector = {locateStrategy: selector.using as Nightwatch.LocateStrategy, selector: selector.value}
  }
  if (utils.types.has(selector, 'selector') && selector.locateStrategy) {
    return {
      type: selector.locateStrategy === 'css selector' ? 'css' : selector.locateStrategy,
      selector: selector.selector,
    }
  }
  return selector
}
export async function findElement(
  driver: Driver,
  selector: Selector,
  parent?: Element | ShadowRoot,
): Promise<Element | null> {
  if (utils.types.has(selector, 'selector') && selector.locateStrategy && !selector.index) {
    return spec.findElement(driver, {using: selector.locateStrategy, value: selector.selector}, parent)
  }
  try {
    return await driver.original.findElement(selector as Nightwatch.Definition)
  } catch {
    return null
  }
}
export async function findElements(
  driver: Driver,
  selector: Selector,
  parent?: Element | ShadowRoot,
): Promise<Element[]> {
  if (utils.types.has(selector, 'selector') && selector.locateStrategy && !selector.index) {
    return spec.findElements(driver, {using: selector.locateStrategy, value: selector.selector}, parent)
  }
  try {
    return await driver.original.findElements(selector as Nightwatch.Definition)
  } catch {
    return []
  }
}

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[NWDriver, () => Promise<void>]> {
  const Nightwatch = require('nightwatch')
  const parseEnv = require('@applitools/test-utils/src/parse-env')

  const {
    browser = '',
    capabilities,
    url,
    configurable = true,
    args = [],
    headless,
    logLevel = 'silent',
  } = parseEnv({...env, legacy: env.legacy ?? process.env.APPLITOOLS_FRAMEWORK_MAJOR_VERSION === '1'})
  const options: any = {
    capabilities: {browserName: browser, ...capabilities},
    webdriver: {
      host: url.hostname,
      port: url.port || (url.protocol.startsWith('https') ? 443 : undefined),
      default_path_prefix: url.pathname,
      check_process_delay: 100,
      max_status_poll_tries: 10,
      status_poll_interval: 200,
      process_create_timeout: 120000,
      start_session: true,
      start_process: false,
    },
    output: logLevel !== 'silent',
    config: null,
    useAsync: true,
  }
  if (configurable) {
    const browserOptionsName = browserOptionsNames[browser || options.capabilities.browserName]
    if (browserOptionsName) {
      const browserOptions = options.capabilities[browserOptionsName] || {}
      browserOptions.args = [...(browserOptions.args || []), ...args]
      if (headless) browserOptions.args.push('headless')
      if (browser === 'firefox') {
        options.capabilities.alwaysMatch = {[browserOptionsName]: browserOptions}
      } else {
        options.capabilities[browserOptionsName] = browserOptions
      }
      // if (browser !== 'firefox' && !browserOptions.mobileEmulation) browserOptions.w3c = false
    }
  }
  if (options.capabilities.browserName === '') options.capabilities.browserName = null
  if (options.capabilities.browserName !== 'firefox') options.selenium = options.webdriver

  const driver = await Nightwatch.createClient(options).launchBrowser()
  return [driver, () => driver.end()]
}
