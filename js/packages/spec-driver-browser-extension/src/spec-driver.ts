import type {Size} from '@applitools/utils'
import type {SpecType, SpecDriver as BaseSpecDriver, CommonSelector, DriverInfo, Cookie} from '@applitools/driver'
import type {Ref} from './refer'
import browser from 'webextension-polyfill'
import * as utils from '@applitools/utils'

export type Driver = {windowId: number; tabId: number}
export type Context = {windowId: number; tabId: number; frameId: number}
export type Element = Ref
export type Selector = {type: 'css' | 'xpath'; selector: string}
export type PrimarySpecType = SpecType<Driver, Context, Element, Selector>
export type SpecDriver = BaseSpecDriver<PrimarySpecType>

declare global {
  interface Window {
    refer: any
  }
}

export function isDriver(driver: any): driver is Driver {
  return utils.types.has(driver, ['windowId', 'tabId'])
}
export function isContext(context: any): context is Context {
  return utils.types.has(context, ['windowId', 'tabId', 'frameId'])
}
export function isElement(element: any): element is Element {
  return utils.types.has(element, 'applitools-ref-id')
}
export function isSelector(selector: any): selector is Selector {
  return utils.types.has(selector, ['type', 'selector'])
}
export function isStaleElementError(error: any): boolean {
  if (!error) return false
  error = error.originalError || error
  return error instanceof Error && error.message === 'StaleElementReferenceError'
}
export function toSelector(selector: CommonSelector<Selector>): Selector {
  if (utils.types.isString(selector)) {
    return {type: 'css', selector: selector}
  } else if (utils.types.has(selector, 'selector')) {
    if (!utils.types.isString(selector.selector)) return selector.selector
    return {
      type: utils.types.has(selector, 'type') ? (selector.type as 'css' | 'xpath') : 'css',
      selector: selector.selector,
    }
  }
  return selector
}
export function extractContext(driver: Driver): Context {
  return {...driver, frameId: 0}
}
export async function executeScript(context: Context, script: (arg: any) => any, arg?: any): Promise<any> {
  const [{result, error}]: any = await browser.scripting.executeScript({
    target: {tabId: context.tabId, frameIds: [context.frameId || 0]},
    func: script,
    args: [arg || null],
  })

  if (error) {
    const err = new Error(error.message)
    err.stack = error.stack
    throw err
  }
  return result
}
export async function findElement(
  context: Context,
  selector: Selector,
  parent?: Element | Node,
): Promise<Element | null> {
  const [{result}] = await browser.scripting.executeScript({
    target: {tabId: context.tabId, frameIds: [context.frameId || 0]},
    /* eslint-disable no-undef */
    func: (selector, parent) => {
      if (selector.type === 'css') {
        const root = parent ? window.refer.deref(parent) : document
        return window.refer.ref(root.querySelector(selector.selector))
      } else if (selector.type === 'xpath') {
        return window.refer.ref(
          document.evaluate(selector.selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue,
        )
      }
    },
    /* eslint-enable no-undef */
    args: [selector, parent || null],
  })
  return result
}
export async function findElements(context: Context, selector: Selector, parent?: Element | Node): Promise<Element[]> {
  const [{result}] = await browser.scripting.executeScript({
    target: {tabId: context.tabId, frameIds: [context.frameId || 0]},
    /* eslint-disable no-undef */
    func: (selector, parent) => {
      if (selector.type === 'css') {
        const root = parent ? window.refer.deref(parent) : document
        return Array.from(root.querySelectorAll(selector.selector), window.refer.ref)
      } else if (selector.type === 'xpath') {
        const iterator = document.evaluate(selector.selector, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE)
        const elements = []
        for (let element = iterator.iterateNext(); element !== null; element = iterator.iterateNext()) {
          elements.push(window.refer.ref(element))
        }
        return elements
      }
    },
    /* eslint-enable no-undef */
    args: [selector, parent || null],
  })
  return result
}
export async function mainContext(context: Context): Promise<Context> {
  return {...context, frameId: 0}
}
export async function parentContext(context: Context): Promise<Context> {
  const frames = await browser.webNavigation.getAllFrames({tabId: context.tabId})
  const frame = frames.find(frame => frame.frameId === context.frameId)
  return {...context, frameId: frame!.parentFrameId}
}
export async function childContext(context: Context, element: Element): Promise<Context> {
  const childFrameId = await new Promise<number>(async (resolve, reject) => {
    const key = utils.general.guid()
    browser.runtime.onMessage.addListener(handler)
    function handler(data: any, sender: any) {
      if (data.key === key) {
        resolve(sender.frameId)
        browser.runtime.onMessage.removeListener(handler)
      }
    }
    await browser.scripting.executeScript({
      target: {tabId: context.tabId, frameIds: [context.frameId || 0]},
      func: (element, key) => {
        window.refer.deref(element).contentWindow.postMessage({key, isApplitools: true}, '*') // eslint-disable-line no-undef
      },
      args: [element, key],
    })
    setTimeout(() => reject(new Error('No such frame')), 5000)
  })

  return {...context, frameId: childFrameId}
}
export async function getDriverInfo(): Promise<DriverInfo> {
  return {features: {canExecuteOnlyFunctionScripts: true}}
}
export async function getWindowSize(driver: Driver): Promise<Size> {
  const [{result}] = await browser.scripting.executeScript({
    target: {tabId: driver.tabId, frameIds: [0]},
    func: () => ({width: window.outerWidth, height: window.outerHeight}),
  })
  return result
}
export async function setWindowSize(driver: Driver, size: Size): Promise<void> {
  await browser.windows.update(driver.windowId, {
    state: 'normal',
    left: 0,
    top: 0,
    width: size.width,
    height: size.height,
  })
}
export async function getCookies(_driver: Driver): Promise<Cookie[]> {
  const cookies = await browser.cookies.getAll({})
  return cookies.map(cookie => {
    const copy: any = {
      ...cookie,
      expiry: cookie.expirationDate,
      sameSite:
        cookie.sameSite === 'no_restriction'
          ? 'None'
          : `${cookie.sameSite[0].toUpperCase()}${cookie.sameSite.slice(1)}`,
    }
    delete copy.expirationDate
    delete copy.hostOnly
    delete copy.session
    delete copy.storeId
    return copy
  })
}
export async function takeScreenshot(driver: Driver): Promise<string> {
  const [activeTab] = await browser.tabs.query({windowId: driver.windowId, active: true})
  await browser.tabs.update(driver.tabId, {active: true})
  const url = await browser.tabs.captureVisibleTab(driver.windowId, {format: 'png'})
  await browser.tabs.update(activeTab.id, {active: true})
  await utils.general.sleep(500)
  return url.replace(/^data:image\/png;base64,/, '')
}
export async function getTitle(driver: Driver): Promise<string> {
  const {title} = await browser.tabs.get(driver.tabId)
  return title || ''
}
export async function getUrl(driver: Driver): Promise<string> {
  const {url} = await browser.tabs.get(driver.tabId)
  return url || ''
}
