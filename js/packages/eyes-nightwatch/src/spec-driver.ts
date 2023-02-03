import type * as Selenium from 'selenium-webdriver'
import type * as Nightwatch from 'nightwatch'
import * as spec from '@applitools/spec-driver-webdriver'
import * as utils from '@applitools/utils'

export * from '@applitools/spec-driver-webdriver'

type ApplitoolsBrand = {__applitoolsBrand?: never}

export type WDDriver = spec.Driver
export type WDElement = spec.Element
export type WDShadowRoot = spec.ShadowRoot
export type WDSelector = spec.Selector

export type Driver = Nightwatch.NightwatchBrowser & ApplitoolsBrand
export type Element = WDElement & ApplitoolsBrand
export type ShadowRoot = ({id_: string} | WDShadowRoot) & ApplitoolsBrand
export type Selector = (Nightwatch.ElementProperties | string | Selenium.Locator) & ApplitoolsBrand

export type ResponseElement = Nightwatch.NightwatchTypedCallbackResult<WDElement> & ApplitoolsBrand

type CommonSelector<TSelector = never> = string | {selector: TSelector | string; type?: string}

const byHash = ['className', 'css', 'id', 'js', 'linkText', 'name', 'partialLinkText', 'tagName', 'xpath'] as const
function isByHashSelector(selector: any): selector is Selenium.ByHash {
  return byHash.includes(Object.keys(selector)[0] as (typeof byHash)[number])
}
const SHADOW_ROOT_ID = 'shadow-6066-11e4-a52e-4f735466cecf'
function extractShadowRootId(shadowRoot: ShadowRoot): string {
  return (
    (shadowRoot as {'shadow-6066-11e4-a52e-4f735466cecf': string})[SHADOW_ROOT_ID] ?? (shadowRoot as {id_: string}).id_
  )
}
function transformShadowRoot(shadowRoot: ShadowRoot): WDShadowRoot {
  return {[SHADOW_ROOT_ID]: extractShadowRootId(shadowRoot)}
}
const XPATH_SELECTOR_START = ['/', '(', '../', './', '*/']
function isXpathSelector(selector: string): boolean {
  return XPATH_SELECTOR_START.some(start => selector.startsWith(start))
}

export function isDriver(driver: any): driver is Driver | WDDriver {
  return spec.isDriver(driver) || utils.types.instanceOf(driver, 'NightwatchAPI')
}
export function isElement(element: any): element is Element | WDElement {
  return spec.isElement(element)
}
export function isShadowRoot(shadowRoot: any): shadowRoot is ShadowRoot {
  if (!shadowRoot) return false
  return spec.isShadowRoot(shadowRoot) || Boolean(extractShadowRootId(shadowRoot))
}
export function isSelector(selector: any): selector is Selector | WDSelector {
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
export function transformDriver(driver: Driver): WDDriver {
  if (spec.isDriver(driver)) return driver
  const selenium = (driver.options as any).selenium
  const webdriver = (driver.options as any).webdriver
  const ssl = selenium?.ssl ?? webdriver?.ssl
  const hostname = selenium?.host ?? webdriver?.host
  const port = selenium?.port ?? webdriver?.port
  const path = selenium?.default_path_prefix ?? webdriver?.default_path_prefix
  const transformedDriver = spec.transformDriver({
    sessionId: driver.sessionId,
    serverUrl: `http${ssl ? 's' : ''}://${hostname ?? 'localhost'}${port ? `:${port}` : ''}${path}`,
    capabilities: (driver as any).capabilities,
  }) as spec.Driver
  transformedDriver.original = driver
  return transformedDriver
}
export function transformElement(element: Element | ResponseElement): Element {
  return utils.types.has(element, 'value') ? spec.transformElement(element.value) : spec.transformElement(element)
}
export function transformSelector(selector: CommonSelector<Selector>): Selector {
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
export function untransformSelector(selector: Selector): CommonSelector | null {
  if (utils.types.instanceOf<Selenium.RelativeBy>(selector, 'RelativeBy') || utils.types.isFunction(selector)) {
    return null
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
  driver: WDDriver,
  selector: Selector,
  parent?: WDElement | WDShadowRoot | ShadowRoot,
): Promise<WDElement | null> {
  const originalDriver = driver.original as Driver
  let element = null as Element | null
  if (utils.types.has(selector, 'selector') && selector.locateStrategy && !selector.index) {
    parent = isShadowRoot(parent) ? transformShadowRoot(parent) : parent
    element = await spec.findElement(driver, {using: selector.locateStrategy, value: selector.selector}, parent)
  } else if (!(Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2)) {
    try {
      element = await originalDriver.findElement(selector as any)
    } catch {
      element = null
    }
  }
  return spec.isElement(element) ? spec.transformElement(element) : null
}
export async function findElements(
  driver: WDDriver,
  selector: Selector,
  parent?: WDElement | WDShadowRoot | ShadowRoot,
): Promise<WDElement[]> {
  const originalDriver = driver.original as Driver
  let elements = [] as Element[]
  if (utils.types.has(selector, 'selector') && selector.locateStrategy && !selector.index) {
    parent = isShadowRoot(parent) ? transformShadowRoot(parent) : parent
    elements = await spec.findElements(driver, {using: selector.locateStrategy, value: selector.selector}, parent)
  } else if (!(Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2)) {
    try {
      elements = await originalDriver.findElements(selector as any)
    } catch {
      elements = []
    }
  }
  return utils.types.isArray(elements) ? elements : []
}

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[Driver, () => Promise<void>]> {
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
  } = parseEnv({...env, legacy: env.legacy ?? process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION === '1'})
  const options: any = {
    output: logLevel !== 'silent',
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

  if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
    options.desiredCapabilities = options.capabilities
    const client = Nightwatch.client(options)
    client.isES6AsyncTestcase = true
    await client.createSession()
    return [client.api, () => client.session.close()]
  } else {
    const driver = await Nightwatch.createClient(options).launchBrowser()
    return [driver, () => driver.end()]
  }
}
