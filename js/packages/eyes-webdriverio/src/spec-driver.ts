import type {SpecType, CommonSelector} from '@applitools/driver'
import * as spec from '@applitools/spec-driver-webdriver'
import * as utils from '@applitools/utils'

export * from '@applitools/spec-driver-webdriver'

type ApplitoolsBrand = {__applitoolsBrand?: never}

export type WDIODriver = Applitools.WebdriverIO.Browser & ApplitoolsBrand
export type WDIOElement = Applitools.WebdriverIO.Element & ApplitoolsBrand
export type WDIOShadowRoot = spec.ShadowRoot & ApplitoolsBrand
export type WDIOSelector = Applitools.WebdriverIO.Selector & ApplitoolsBrand
export type WDIOSpecType = SpecType<WDIODriver, WDIODriver, WDIOElement, WDIOSelector, never>

export type SecondaryDriver = (WDIODriver | spec.StaticDriver) & ApplitoolsBrand
export type SecondaryElement = WDIOElement & ApplitoolsBrand
export type SecondarySelector = spec.Selector & ApplitoolsBrand
export type SecondarySpecType = SpecType<SecondaryDriver, never, SecondaryElement, SecondarySelector, never>

export type Driver = spec.Driver<WDIODriver> & ApplitoolsBrand
export type Element = spec.Element & {selector?: Selector} & ApplitoolsBrand
export type ShadowRoot = spec.ShadowRoot & ApplitoolsBrand
export type Selector = WDIOSelector & ApplitoolsBrand
export type PrimarySpecType = SpecType<Driver, Driver, Element, Selector, SecondarySpecType>

const LEGACY_ELEMENT_ID = 'ELEMENT'
const ELEMENT_ID = 'element-6066-11e4-a52e-4f735466cecf'
const SHADOW_ROOT_ID = 'shadow-6066-11e4-a52e-4f735466cecf'
const DIRECT_SELECTOR_REGEXP =
  /^(id|css selector|xpath|link text|partial link text|name|tag name|class name|-android uiautomator|-android datamatcher|-android viewmatcher|-android viewtag|-ios uiautomation|-ios predicate string|-ios class chain|accessibility id):(.+)/

async function getSearchRoot(driver: Driver, parent?: Element | ShadowRoot) {
  const root = driver.original
  if (parent) {
    const elementId =
      (parent as any)[SHADOW_ROOT_ID] || (parent as any)[ELEMENT_ID] || (parent as any)[LEGACY_ELEMENT_ID]
    return root.$({[ELEMENT_ID]: elementId})
  }
  return root
}

export function isSecondaryDriver(driver: any): driver is SecondaryDriver {
  if (!driver) return false
  return spec.isSecondaryDriver(driver) || utils.types.instanceOf<WDIODriver>(driver, 'Browser')
}
export function isSecondaryElement(element: any): element is SecondaryElement {
  return !!element?.elementId
}
export function isSelector(selector: any): selector is Selector {
  return utils.types.isString(selector) || utils.types.has(selector, 'strategyName') || utils.types.isFunction(selector)
}
export function isSecondarySelector(selector: any): selector is SecondarySelector {
  return spec.isSelector(selector)
}
export function toDriver(driver: SecondaryDriver): Driver | Promise<Driver> {
  if (spec.isSecondaryDriver(driver)) return spec.toDriver(driver) as Driver | Promise<Driver>
  if (driver.isDevTools) {
    driver.addCommand('sendCommandAndGetResult', async (name: any, options: any) => {
      const puppeteer = await driver.getPuppeteer()
      const [page] = await puppeteer.pages()
      const session = await page.target().createCDPSession()
      return session.send(name, options)
    })
  }
  const transformedDriver = Object.create(driver as unknown as Driver, {
    original: {enumerable: false, get: () => driver},
  })
  return transformedDriver
}
export function toElement(element: SecondaryElement): Element {
  if (utils.types.has(element, 'elementId')) {
    return {
      [ELEMENT_ID]: element.elementId,
      [LEGACY_ELEMENT_ID]: element.elementId,
      selector: isSelector(element.selector) ? element.selector : undefined,
    }
  }
  return element
}
export function toSelector(selector: SecondarySelector | CommonSelector<Selector | SecondarySelector>): Selector {
  if (utils.types.has(selector, 'selector')) {
    if (utils.types.has(selector, 'type') && selector.type && utils.types.isString(selector.selector)) {
      return `${selector.type === 'css' ? 'css selector' : selector.type}:${selector.selector}`
    } else if (isSelector(selector.selector)) {
      return selector.selector
    } else {
      selector = selector.selector
    }
  }
  if (utils.types.has(selector, ['using', 'value'])) {
    return `${selector.using}:${selector.value}`
  }
  return selector
}
export function toSimpleCommonSelector(selector: Selector): CommonSelector | null {
  if (utils.types.isFunction(selector) || utils.types.has(selector, 'strategyName')) return null
  else if (utils.types.isString(selector)) {
    const match = selector.match(DIRECT_SELECTOR_REGEXP)
    if (!match) return {selector}
    const [, using, value] = match
    return {type: using === 'css selector' ? 'css' : using, selector: value}
  }
  return selector
}
export function extractSelector(element: Element): Selector | null {
  return element.selector ?? null
}
export async function executeScript(driver: Driver, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  if (driver.original.isDevTools) {
    script = script.toString()
    script = script.startsWith('function') ? `return (${script}).apply(null, arguments)` : script
    return driver.original.execute(runner, script.toString(), ...unwrap(arg))
  }
  return spec.executeScript(driver, script, arg)

  function runner(script: string, arg: any, ...elements: Element[]) {
    return new Function(script).call(null, wrap(arg))

    function wrap(value: any): any {
      if (value === 'pptr-element-marker') {
        return elements.shift()
      } else if (Array.isArray(value)) {
        return value.map(wrap)
      } else if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, wrap(value)]))
      } else {
        return value
      }
    }
  }
  function unwrap(arg: any): [any?, ...Element[]] {
    if (!arg) return []
    const elements: Element[] = []
    return [unwrap(arg), ...elements]

    function unwrap(value: any): any {
      if (spec.isElement(value)) {
        elements.push(value)
        return 'pptr-element-marker'
      } else if (utils.types.isArray(value)) {
        return value.map(unwrap)
      } else if (utils.types.isObject(value)) {
        return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, unwrap(value)]))
      } else {
        return value
      }
    }
  }
}
export async function findElement(
  driver: Driver,
  selector: Selector,
  parent?: Element | ShadowRoot,
): Promise<Element | null> {
  const root = await getSearchRoot(driver, parent)
  try {
    const element = await root.$(selector)
    return !utils.types.has(element, 'error') ? spec.toElement(element) : null
  } catch (error: any) {
    return null
  }
}
export async function findElements(
  driver: Driver,
  selector: Selector,
  parent?: Element | ShadowRoot,
): Promise<Element[]> {
  const root = await getSearchRoot(driver, parent)
  const elements = await root.$$(selector)
  return Array.from(elements, spec.toElement)
}

const browserOptionsNames: Record<string, string> = {
  chrome: 'goog:chromeOptions',
  firefox: 'moz:firefoxOptions',
}
export async function build(env: any): Promise<[WDIODriver, () => Promise<void>]> {
  let frameworkPath
  try {
    frameworkPath = require.resolve('webdriverio', {paths: [`${process.cwd()}/node_modules`]})
  } catch {
    frameworkPath = 'webdriverio'
  }
  const {remote} = require(frameworkPath)
  const chromedriver = require('chromedriver')
  const parseEnv = require('@applitools/test-utils/src/parse-env')
  const {
    protocol,
    browser = '',
    emulation,
    capabilities,
    url,
    attach,
    proxy,
    configurable = true,
    args = [],
    headless,
    logLevel = 'silent',
  } = parseEnv(env, process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL)

  const options: any = {
    capabilities: {browserName: browser, ...capabilities},
    logLevel,
    connectionRetryCount: 5,
    connectionRetryTimeout: 180000,
  }
  if (browser === 'chrome' && protocol === 'cdp') {
    options.automationProtocol = 'devtools'
    options.capabilities[browserOptionsNames.chrome] = {args}
    options.capabilities['wdio:devtoolsOptions'] = {
      headless,
      ignoreDefaultArgs: ['--hide-scrollbars'],
    }
  } else if (protocol === 'wd') {
    options.automationProtocol = 'webdriver'
    options.protocol = url.protocol ? url.protocol.replace(/:$/, '') : undefined
    options.hostname = url.hostname
    if (url.port) options.port = Number(url.port)
    else if (options.protocol === 'http') options.port = 80
    else if (options.protocol === 'https') options.port = 443
    options.path = url.pathname
    if (configurable) {
      if (browser === 'chrome' && attach) {
        await chromedriver.start(['--port=9515'], true)
        options.protocol = 'http'
        options.hostname = 'localhost'
        options.port = 9515
        options.path = '/'
      }
      const browserOptionsName = browserOptionsNames[browser || options.capabilities.browserName]
      if (browserOptionsName) {
        const browserOptions = options.capabilities[browserOptionsName] || {}
        browserOptions.args = [...(browserOptions.args || []), ...args]
        if (headless) browserOptions.args.push('headless')
        if (attach) {
          browserOptions.debuggerAddress = attach === true ? 'localhost:9222' : attach
          if (browser !== 'firefox') browserOptions.w3c = false
        }
        options.capabilities[browserOptionsName] = browserOptions
      }
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
  const driver = await remote(options)
  if (driver.isDevTools && emulation) {
    const puppeteer = await driver.getPuppeteer()
    const [page] = await puppeteer.pages()
    if (emulation.deviceMetrics) {
      await page.setViewport({
        width: emulation.deviceMetrics.width,
        height: emulation.deviceMetrics.height,
        deviceScaleFactor: emulation.deviceMetrics.pixelRatio,
      })
    }
    if (emulation.userAgent) {
      await page.setUserAgent(emulation.userAgent)
    }
  }
  return [driver, () => driver.deleteSession().then(() => chromedriver.stop())]
}
