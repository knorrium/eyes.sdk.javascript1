import type {Size} from '@applitools/utils'
import type {SpecType, SpecDriver as BaseSpecDriver, CommonSelector, Cookie, DriverInfo} from '@applitools/driver'
import type * as Playwright from 'playwright'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import * as utils from '@applitools/utils'

type ApplitoolsBrand = {__applitoolsBrand?: never}

export type Driver = Playwright.Page & ApplitoolsBrand
export type Context = Playwright.Frame & ApplitoolsBrand
export type Element<T = Node> = Playwright.ElementHandle<T> & ApplitoolsBrand
export type Selector = (string | Playwright.Locator) & ApplitoolsBrand
export type PrimarySpecType = SpecType<Driver, Context, Element, Selector, never>
export type SpecDriver = BaseSpecDriver<PrimarySpecType>

async function handleToObject(handle: Playwright.JSHandle): Promise<any> {
  let [, type] = handle.toString().match(/(?:.+@)?(\w*)(?:\(\d+\))?/i) ?? []
  type = type?.toLowerCase()
  if (type === 'array') {
    const map = await handle.getProperties()
    return Promise.all(Array.from(map.values(), handleToObject))
  } else if (type === 'object') {
    const map = await handle.getProperties()
    const chunks = await Promise.all(Array.from(map, async ([key, handle]) => ({[key]: await handleToObject(handle)})))
    return chunks.length > 0 ? Object.assign(...(chunks as [any])) : {}
  } else if (type === 'node') {
    return handle.asElement()
  } else {
    return handle.jsonValue()
  }
}

export function isDriver(page: any): page is Driver {
  if (!page) return false
  return utils.types.instanceOf<Playwright.Page>(page, 'Page')
}
export function isContext(frame: any): frame is Context {
  if (!frame) return false
  return utils.types.instanceOf<Playwright.Frame>(frame, 'Frame')
}
export function isElement(element: any): element is Element {
  if (!element) return false
  return utils.types.instanceOf<Playwright.ElementHandle>(element, 'ElementHandle')
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return utils.types.isString(selector) || utils.types.instanceOf<Playwright.Locator>(selector, 'Locator')
}
export function isStaleElementError(err: any): boolean {
  return (
    err?.message?.includes('Element is not attached to the DOM') || // universal message
    err?.message?.includes('Protocol error (DOM.describeNode)') || // chrome message
    err?.message?.includes('Protocol error (Page.adoptNode)') || // firefox message
    err?.message?.includes('Unable to adopt element handle from a different document') // webkit message
  )
}
export function toSelector(selector: CommonSelector<Selector>): Selector {
  if (utils.types.has(selector, 'selector')) {
    if (!utils.types.has(selector, 'type')) return selector.selector
    else return `${selector.type}=${selector.selector}`
  }
  return selector
}
export function toSimpleCommonSelector(selector: Selector): CommonSelector {
  if (utils.types.instanceOf<Playwright.Locator>(selector, 'Locator')) {
    ;[, selector] = selector.toString().match(/Locator@(.+)/)!
  }
  if (utils.types.isString(selector)) return {selector}
  return selector
}
export function extractContext(page: Driver): Context {
  return isDriver(page) ? page.mainFrame() : page
}
export async function executeScript(frame: Context, script: ((arg: any) => any) | string, arg: any): Promise<any> {
  script = utils.types.isString(script) ? (new Function(script) as (arg: any) => any) : script
  const result = await frame.evaluateHandle(script, arg)
  return handleToObject(result)
}
export async function findElement(
  frame: Context,
  selector: Selector,
  parent?: Element,
): Promise<Element<SVGElement | HTMLElement> | null> {
  if (utils.types.instanceOf<Playwright.Locator>(selector, 'Locator')) {
    return selector.elementHandle()
  }
  const root = parent ?? frame
  return root.$(selector)
}
export async function findElements(
  frame: Context,
  selector: Selector,
  parent?: Element,
): Promise<Element<SVGElement | HTMLElement>[]> {
  if (utils.types.instanceOf<Playwright.Locator>(selector, 'Locator')) {
    return (await selector.elementHandles()) as Element<SVGElement | HTMLElement>[]
  }
  const root = parent ?? frame
  return root.$$(selector)
}
export async function setElementText(frame: Context, element: Element | Selector, text: string): Promise<void> {
  const resolvedElement = isSelector(element) ? await findElement(frame, element) : element
  await resolvedElement?.fill(text)
}
export async function hover(_frame: Context, element: Element): Promise<void> {
  await element.hover()
}
export async function click(_frame: Context, element: Element): Promise<void> {
  await element.click()
}
export async function mainContext(frame: Context): Promise<Context> {
  let mainFrame = frame
  while (mainFrame.parentFrame()) {
    mainFrame = mainFrame.parentFrame()!
  }
  return mainFrame
}
export async function parentContext(frame: Context): Promise<Context> {
  return frame.parentFrame() ?? frame
}
export async function childContext(_frame: Context, element: Element): Promise<Context> {
  const frame = (await element.contentFrame())!
  return frame
}
export async function getDriverInfo(_page: Driver): Promise<DriverInfo> {
  return {features: {allCookies: true}}
}
export async function getViewportSize(page: Driver): Promise<Size> {
  return page.viewportSize()!
}
export async function setViewportSize(page: Driver, size: Size): Promise<void> {
  return page.setViewportSize(size)
}
export async function getCookies(page: Driver): Promise<Cookie[]> {
  const cookies = await page.context().cookies()
  return cookies.map(cookie => {
    const copy = {...cookie, expiry: cookie.expires} as Record<keyof typeof cookie, any> & Cookie
    delete copy.expires
    return copy
  })
}
export async function getTitle(page: Driver): Promise<string> {
  return page.title()
}
export async function getUrl(page: Driver): Promise<string> {
  return page.url()
}
export async function visit(page: Driver, url: string): Promise<void> {
  await page.goto(url)
}
export async function takeScreenshot(page: Driver): Promise<Uint8Array> {
  return page.screenshot()
}

const browserNames: Record<string, string> = {
  chrome: 'chromium',
  safari: 'webkit',
  firefox: 'firefox',
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
  let frameworkPath
  try {
    frameworkPath = require.resolve('playwright', {paths: [`${process.cwd()}/node_modules`]})
  } catch {
    frameworkPath = 'playwright'
  }
  const playwright = require(frameworkPath)
  const parseEnv = require('@applitools/test-utils/src/parse-env')
  const {browser, device, url, attach, proxy, args = [], headless, extension} = parseEnv(env, 'cdp')
  const launcher = playwright[browserNames[browser] || browser]
  if (!launcher) throw new Error(`Browser "${browser}" is not supported.`)
  if (attach) throw new Error(`Attaching to the existed browser doesn't supported by playwright`)
  const options: any = {
    args,
    headless: headless && !extension,
    ignoreDefaultArgs: ['--hide-scrollbars'],
  }

  // TODO remove this once Playwright provides formal support for headless: 'new' (https://github.com/microsoft/playwright/issues/21194)
  if (headless === 'new') {
    options.args.push('--headless=new')
    delete options.headless
    options.ignoreDefaultArgs.push('--headless')
  }

  if (extension) {
    options.args.push(`--load-extension=${extension}`, `--disable-extensions-except=${extension}`)
  }
  if (proxy) {
    options.proxy = {
      server: proxy.https || proxy.http || proxy.server,
      bypass: proxy.bypass.join(','),
    }
  }
  let driver: Playwright.Browser, context: Playwright.BrowserContext
  if (extension) {
    context = await launcher.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-user-data-dir')), {
      ...options,
      viewport: null,
      ...(device ? playwright.devices[device] : {}),
    })
  } else {
    if (url) {
      if (utils.types.isArray(options.ignoreDefaultArgs)) {
        url.searchParams.set('ignoreDefaultArgs', options.ignoreDefaultArgs.join(','))
      }
      url.searchParams.set('headless', options.headless)
      options.args.forEach((arg: string) => url.searchParams.set(...arg.split('=')))
      driver = await launcher.connect({wsEndpoint: url.href})
    } else {
      driver = await launcher.launch(options)
    }
    context = await driver.newContext(device ? playwright.devices[device] : {})
  }
  const page = await context.newPage()
  return [page, () => (driver ? driver.close() : context.close())]
}
