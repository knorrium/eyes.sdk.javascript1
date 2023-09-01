import type {Size} from '@applitools/utils'
import type {SpecType, SpecDriver as BaseSpecDriver, CommonSelector, DriverInfo} from '@applitools/driver'
import * as testcafe from 'testcafe'
import * as fs from 'fs'
import * as utils from '@applitools/utils'

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace TestCafe {
  export type TestController = globalThis.TestController
  export type NodeSnapshot = globalThis.NodeSnapshot
  export type Selector = globalThis.Selector
  export type SelectorOptions = globalThis.SelectorOptions
}

type ApplitoolsBrand = {__applitoolsBrand?: never}

export type SecondaryElement = TestCafe.NodeSnapshot
export type SecondarySpecType = SpecType<never, never, SecondaryElement, never, never>

export type Driver = TestCafe.TestController & ApplitoolsBrand
export type Element = TestCafe.Selector & ApplitoolsBrand
export type Selector = TestCafe.Selector & ApplitoolsBrand
export type PrimarySpecType = SpecType<Driver, Driver, Element, Selector, SecondarySpecType>
export type SpecDriver = BaseSpecDriver<PrimarySpecType>

function XPathSelector(selector: string, options?: TestCafe.SelectorOptions): TestCafe.Selector {
  const getElementsByXPath = testcafe.Selector(xpath => {
    /* eslint-disable no-undef */
    const iterator = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null)
    /* eslint-enable */
    const items = []

    let item = iterator.iterateNext()

    while (item) {
      items.push(item)
      item = iterator.iterateNext()
    }

    return items
  }, options)
  return testcafe.Selector(getElementsByXPath(selector), options)
}
function deserializeResult(result: any, elements: Element[]): any {
  if (!result) {
    return result
  } else if (result.isElement) {
    return elements.shift()
  } else if (utils.types.isArray(result)) {
    return result.map(result => deserializeResult(result, elements))
  } else if (utils.types.isObject(result)) {
    return Object.entries(result).reduce((object, [key, value]) => {
      return Object.assign(object, {[key]: deserializeResult(value, elements)})
    }, {})
  } else {
    return result
  }
}
const scriptRunner = testcafe.ClientFunction(() => {
  // @ts-ignore
  const {script, arg} = input as {script: string; arg: any}
  const func = new Function(script.startsWith('function') ? `return (${script}).apply(null, arguments)` : script)
  const elements: HTMLElement[] = []
  const result = serializeResult(func(deserializeArg(arg)))

  const resultId = elements.length > 0 ? String(Math.floor(Math.random() * 1000)) : null
  if (resultId) {
    const APPLITOOLS_NAMESPACE = '__TESTCAFE_EYES_APPLITOOLS__'
    const global = window as any
    if (!global[APPLITOOLS_NAMESPACE]) global[APPLITOOLS_NAMESPACE] = {}
    global[APPLITOOLS_NAMESPACE][resultId] = elements
  }
  return {result, resultId, elementsCount: elements.length}

  function deserializeArg(arg: any): any {
    if (!arg) {
      return arg
    } else if (typeof arg === 'function') {
      return arg()
    } else if (Array.isArray(arg)) {
      return arg.map(deserializeArg)
    } else if (typeof arg === 'object') {
      return Object.entries(arg).reduce((object, [key, value]) => {
        return Object.assign(object, {[key]: deserializeArg(value)})
      }, {})
    } else {
      return arg
    }
  }

  function serializeResult(result: any): any {
    if (!result) {
      return result
    } else if (result instanceof window.HTMLElement) {
      elements.push(result)
      return {isElement: true}
    } else if (Array.isArray(result)) {
      return result.map(serializeResult)
    } else if (typeof result === 'object') {
      return Object.entries(result).reduce((object, [key, value]) => {
        return Object.assign(object, {[key]: serializeResult(value)})
      }, {})
    } else {
      return result
    }
  }
})
const elementsExtractor = testcafe.Selector(() => {
  // @ts-ignore
  const {resultId} = input as {resultId: string}
  const APPLITOOLS_NAMESPACE = '__TESTCAFE_EYES_APPLITOOLS__'
  const global = window as any
  if (!global[APPLITOOLS_NAMESPACE] || !global[APPLITOOLS_NAMESPACE][resultId]) return []
  const elements = global[APPLITOOLS_NAMESPACE][resultId]
  return elements
})

export function isDriver(t: any): t is Driver {
  return utils.types.instanceOf(t, 'TestController')
}
export function isElement(element: any): element is Element {
  if (!element) return false
  return !!(element.addCustomMethods && element.find && element.parent)
}
export function isSecondaryElement(element: any): element is SecondaryElement {
  if (!element) return false
  return !!(element.nodeType && isElement(element.selector))
}
export function isSelector(selector: any): selector is Selector {
  if (!selector) return false
  return Boolean(selector.addCustomMethods && selector.find && selector.parent)
}
export function toElement(element: SecondaryElement): Element {
  if (utils.types.isFunction((element as any).selector)) return (element as any).selector
  return element as never
}
export function toSelector(selector: CommonSelector<Selector>): Selector {
  if (utils.types.has(selector, 'selector')) {
    let current = selector
    let transformed =
      selector.type === 'xpath' ? XPathSelector(current.selector as string) : testcafe.Selector(current.selector)
    while (current.child || current.shadow) {
      if (current.child) {
        current = utils.types.has(current.child, 'selector') ? current.child : {selector: current.child}
        transformed = transformed.find(current.selector as string)
      } else if (current.shadow) {
        current = utils.types.has(current.shadow, 'selector') ? current.shadow : {selector: current.shadow}
        transformed = transformed.shadowRoot().find(current.selector as string)
      }
    }
    return transformed
  }
  return testcafe.Selector(selector)
}
export function extractSelector(element: Element): Selector {
  return utils.types.isFunction((element as any).selector) ? (element as any).selector : element
}
export async function executeScript(t: Driver, script: ((arg: any) => any) | string, arg?: any): Promise<any> {
  script = utils.types.isFunction(script) ? script.toString() : script

  const {result, resultId, elementsCount} = await scriptRunner.with({
    boundTestRun: t,
    dependencies: {input: {script, arg}},
  })()

  if (!result || !resultId) return result

  const elements = elementsExtractor.with({
    boundTestRun: t,
    dependencies: {input: {resultId}},
  })

  return deserializeResult(
    result,
    Array.from({length: elementsCount}, (_, index) => elements.nth(index)),
  )
}
export async function findElement(t: Driver, selector: Selector): Promise<Element | null> {
  const element = await selector.with({boundTestRun: t})()
  return element ? (element as any).selector : null
}
export async function findElements(t: Driver, selector: Selector): Promise<Element[]> {
  const elements = selector.with({boundTestRun: t})
  return Array.from({length: await elements.count}, (_, index) => elements.nth(index))
}
export async function click(t: Driver, element: Element): Promise<void> {
  await t.click(element)
}
export async function setElementText(t: Driver, element: Element, text: string): Promise<void> {
  await t.typeText(element, text)
}
export async function hover(t: Driver, element: Element): Promise<void> {
  await t.hover(element)
}
export async function mainContext(t: Driver): Promise<Driver> {
  await t.switchToMainWindow()
  return t
}
export async function childContext(t: Driver, element: Element): Promise<Driver> {
  await t.switchToIframe(element)
  return t
}
export async function getDriverInfo(_t: Driver): Promise<DriverInfo> {
  return {features: {nestedSelectors: true}}
}
export async function setViewportSize(t: Driver, size: Size): Promise<void> {
  await t.resizeWindow(size.width, size.height)
}
export async function getTitle(t: Driver): Promise<string> {
  try {
    return await testcafe.Selector('title', {boundTestRun: t}).innerText
  } catch (error) {
    return ''
  }
}
export async function getUrl(t: Driver): Promise<string> {
  return testcafe.ClientFunction(() => document.location.href, {boundTestRun: t})()
}
export async function visit(t: Driver, url: string): Promise<void> {
  await t.navigateTo(url)
}
export async function takeScreenshot(t: Driver): Promise<Buffer> {
  // NOTE:
  // Since we are constrained to saving screenshots to disk, we place each screenshot in its own
  // dot-folder which has a GUID prefix (e.g., .applitools-guide/screenshot.png).
  // We then read the file from disk, return the buffer, and delete the folder.
  const screenshotPath = await t.takeScreenshot({
    // thumbnails: false,
    path: `.applitools/${utils.general.guid()}.png`,
  })
  try {
    return fs.readFileSync(screenshotPath)
  } finally {
    fs.unlinkSync(screenshotPath)
  }
}
