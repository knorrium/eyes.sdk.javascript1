import type {Size} from '@applitools/utils'
import {type Cookie} from '@applitools/driver'
import * as spec from '../../src/spec-driver'
import * as utils from '@applitools/utils'
import assert from 'assert'

function extractElementId(element: any) {
  return (
    element['element-6066-11e4-a52e-4f735466cecf'] || element['shadow-6066-11e4-a52e-4f735466cecf'] || element.ELEMENT
  )
}

function equalElements(driver: spec.Driver, element1: spec.Element, element2: spec.Element): Promise<boolean> {
  return driver.executeScript('return arguments[0] === arguments[1]', [element1, element2]).catch(() => false)
}

describe('spec driver', async () => {
  let driver: spec.Driver, destroyDriver: null | (() => Promise<void>)
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('headless desktop (@webdriver)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      await driver.navigateTo(url)
    })

    after(async () => {
      await destroyDriver?.()
      destroyDriver = null
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: driver, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {} as spec.Driver, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: await driver.findElement('css selector', 'div'), expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {} as spec.Element, expected: false})
    })
    it('isSelector({using, value})', async () => {
      await isSelector({input: {using: 'xpath', value: '//div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('toDriver(static-driver)', async () => {
      const serverUrl = `${driver.options.protocol}://${driver.options.hostname}:${driver.options.port}/${driver.options.path}`
      await toDriver({input: {sessionId: driver.sessionId, serverUrl, capabilities: driver.capabilities}})
    })
    it('toElement(element)', async () => {
      await toElement({input: (await driver.findElement('css selector', 'div')) as any})
    })
    it('toElement(static-element)', async () => {
      await toElement({input: {elementId: 'element-guid'}})
    })
    it('toSimpleCommonSelector(css-selector)', async () => {
      await toSimpleCommonSelector({
        input: {using: 'css selector', value: '.class'},
        expected: {type: 'css', selector: '.class'},
      })
    })
    it('toSimpleCommonSelector(xpath-selector)', async () => {
      await toSimpleCommonSelector({
        input: {using: 'xpath', value: '//html'},
        expected: {type: 'xpath', selector: '//html'},
      })
    })
    it('toSimpleCommonSelector(string)', async () => {
      await toSimpleCommonSelector({input: '.class', expected: '.class'})
    })
    it('toSimpleCommonSelector(common-selector)', async () => {
      await toSimpleCommonSelector({
        input: {type: 'selector', selector: '.class'},
        expected: {type: 'selector', selector: '.class'},
      })
    })
    it('isEqualElements(element, element)', async () => {
      const element = await driver.findElement('css selector', 'div')
      await isEqualElements({
        input: {element1: element, element2: element},
        expected: true,
      })
    })
    it('isEqualElements(element1, element2)', async () => {
      isEqualElements({
        input: {
          element1: await driver.findElement('css selector', 'div'),
          element2: await driver.findElement('css selector', 'h1'),
        },
        expected: false,
      })
    })
    it('mainContext()', async () => {
      await mainContext()
    })
    it('parentContext()', async () => {
      await parentContext()
    })
    it('childContext(element)', async () => {
      await childContext()
    })
    it('executeScript(strings, args)', async () => {
      await executeScript()
    })
    it('findElement({using, value})', async () => {
      await findElement({input: {selector: {using: 'css selector', value: 'div'}}})
    })
    it('findElement({using, value}, element-root)', async () => {
      await findElement({
        input: {
          selector: {using: 'css selector', value: 'div'},
          parent: await driver.findElement('css selector', '.main'),
        },
      })
    })
    it('findElement({using, value}, shadow-root)', async () => {
      await findElement({
        input: {
          selector: {using: 'css selector', value: 'div'},
          parent: await driver.executeScript('return arguments[0].shadowRoot', [
            await driver.findElement('css selector', '#shadow'),
          ]),
        },
      })
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: {using: 'css selector', value: 'non-existent'}}, expected: null})
    })
    it('findElements({using, value})', async () => {
      await findElements({input: {selector: {using: 'css selector', value: 'div'}}})
    })
    it('findElements({using, value}, element-root)', async () => {
      await findElements({
        input: {
          selector: {using: 'css selector', value: 'div'},
          parent: await driver.findElement('css selector', '.main'),
        },
      })
    })
    it('findElements({using, value}, shadow-root)', async () => {
      await findElements({
        input: {
          selector: {using: 'css selector', value: 'div'},
          parent: await driver.executeScript('return arguments[0].shadowRoot', [
            await driver.findElement('css selector', '#shadow'),
          ]),
        },
      })
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: {using: 'css selector', value: 'non-existent'}}})
    })
    it('setElementText(element, text)', async () => {
      await setElementText({
        input: {element: await driver.findElement('css selector', 'input'), text: 'Ad multos annos'},
      })
    })
    it('setViewportSize()', async () => {
      await setViewportSize({input: {width: 100, height: 100}})
    })
    it('getCookies()', async () => {
      await getCookies()
    })
    it('getCookies(context)', async () => {
      await getCookies({input: {context: true}})
    })
    it('getTitle()', async () => {
      await getTitle()
    })
    it('getUrl()', async () => {
      await getUrl()
    })
    it('visit()', async () => {
      await visit()
    })
  })

  describe('legacy browser (@webdriver)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'ie-11', legacy: true})
    })

    after(async () => {
      if (destroyDriver) await destroyDriver()
      destroyDriver = null
    })

    it('getWindowSize()', async () => {
      await getWindowSize({legacy: true})
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({legacy: true, input: {width: 551, height: 552}})
    })
  })

  describe('mobile browser (@mobile)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome', device: 'Pixel 3a XL'})
    })

    after(async () => {
      if (destroyDriver) await destroyDriver()
      destroyDriver = null
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'portrait'})
    })
  })

  describe('native app (@mobile @native @android)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({
        app: 'https://applitools.jfrog.io/artifactory/Examples/android/1.3/app-debug.apk',
        device: 'Pixel 3a XL',
      })
      await spec.click(driver, (await spec.findElement(driver, {using: 'id', value: 'btn_web_view'}))!)
      await utils.general.sleep(5000)
    })

    after(async () => {
      await destroyDriver?.()
      destroyDriver = null
    })

    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('getOrientation()', async () => {
      await getOrientation({expected: 'portrait'})
    })
    it('getCurrentWorld()', async () => {
      await getCurrentWorld()
    })
    it('getWorlds()', async () => {
      await getWorlds()
    })
    it('switchWorld(name)', async () => {
      await switchWorld({input: {name: 'WEBVIEW_com.applitools.eyes.android'}})
    })
  })

  describe('native app (@mobile @native @ios)', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({
        app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp/1.9/app/IOSTestApp.zip',
        device: 'iPhone 13',
        capabilities: {'appium:fullContextList': true},
      })
      await spec.click(driver, (await spec.findElement(driver, {using: 'accessibility id', value: 'Web view'}))!)
      await utils.general.sleep(5000)
      await spec.getWorlds(driver)
      await utils.general.sleep(5000)
    })

    after(async () => {
      await destroyDriver?.()
      destroyDriver = null
    })

    it('getCurrentWorld()', async () => {
      await getCurrentWorld()
    })
    it('getWorlds()', async () => {
      await getWorlds()
    })
    it('switchWorld(name)', async () => {
      const [, name] = await spec.getWorlds(driver)
      await switchWorld({input: {name}})
    })
  })

  async function isDriver({input, expected}: {input: spec.Driver; expected: boolean}) {
    const result = await spec.isDriver(input)
    assert.strictEqual(result, expected)
  }
  async function isElement({input, expected}: {input: spec.Element; expected: boolean}) {
    const result = await spec.isElement(input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}: {input: spec.Selector; expected: boolean}) {
    const result = await spec.isSelector(input)
    assert.strictEqual(result, expected)
  }
  async function isEqualElements({
    input,
    expected,
  }: {
    input: {element1: spec.Element; element2: spec.Element}
    expected: boolean
  }) {
    const result = await spec.isEqualElements(driver, input.element1, input.element2)
    assert.deepStrictEqual(result, expected)
  }
  async function toDriver({input}: {input: spec.StaticDriver}) {
    const transformedDriver = await spec.toDriver(input)
    const result = await transformedDriver.getUrl()
    const expected = await transformedDriver.getUrl()
    assert.deepStrictEqual(result, expected)
  }
  async function toElement({input}: {input: spec.StaticElement}) {
    const elementId = utils.types.has(input, 'elementId') ? input.elementId : extractElementId(input)
    const result = spec.toElement(input)
    assert.deepStrictEqual(result, {
      ELEMENT: elementId,
      'element-6066-11e4-a52e-4f735466cecf': elementId,
    })
  }
  async function toSimpleCommonSelector({
    input,
    expected,
  }: {
    input: spec.Selector | {type: string; selector: string} | string | null
    expected: {type: string; selector: string} | string | null
  }) {
    assert.deepStrictEqual(spec.toSimpleCommonSelector(input as spec.Selector), expected)
  }
  async function executeScript() {
    const element = await driver.findElement('css selector', 'html')
    const args = [0, 'string', {key: 'value'}, [0, 1, 2, 3]]
    const [resultElement, ...resultArgs] = await spec.executeScript(driver, 'return arguments[0]', [element, ...args])
    assert.deepStrictEqual(resultArgs, args)
    assert.ok(await spec.isEqualElements(driver, resultElement, element))
  }
  async function mainContext() {
    try {
      const mainDocument = await driver.findElement('css selector', 'html')
      await driver.switchToFrame(await driver.findElement('css selector', '[name="frame"]'))
      await driver.switchToFrame(await driver.findElement('css selector', '[name="frame-nested"]'))
      const frameDocument = await driver.findElement('css selector', 'html')
      assert.ok(!(await spec.isEqualElements(driver, mainDocument, frameDocument)))
      await spec.mainContext(driver)
      const resultDocument = await driver.findElement('css selector', 'html')
      assert.ok(await spec.isEqualElements(driver, resultDocument, mainDocument))
    } finally {
      await driver.switchToFrame(null).catch(() => null)
    }
  }
  async function parentContext() {
    try {
      await driver.switchToFrame(await driver.findElement('css selector', '[name="frame"]'))
      const parentDocument = await driver.findElement('css selector', 'html')
      await driver.switchToFrame(await driver.findElement('css selector', '[name="frame-nested"]'))
      const frameDocument = await driver.findElement('css selector', 'html')
      assert.ok(!(await spec.isEqualElements(driver, parentDocument, frameDocument)))
      await spec.parentContext(driver)
      const resultDocument = await driver.findElement('css selector', 'html')
      assert.ok(await spec.isEqualElements(driver, resultDocument, parentDocument))
    } finally {
      await driver.switchToFrame(null).catch(() => null)
    }
  }
  async function childContext() {
    try {
      const element = await driver.findElement('css selector', '[name="frame"]')
      await driver.switchToFrame(element)
      const expectedDocument = await driver.findElement('css selector', 'html')
      await driver.switchToFrame(null)
      await spec.childContext(driver, element)
      const resultDocument = await driver.findElement('css selector', 'html')
      assert.ok(await spec.isEqualElements(driver, resultDocument, expectedDocument))
    } finally {
      await driver.switchToFrame(null).catch(() => null)
    }
  }
  async function getCurrentWorld() {
    const actual = await spec.getCurrentWorld(driver)
    const expected = 'NATIVE_APP'
    assert.deepStrictEqual(actual, expected)
  }
  async function getWorlds() {
    const actual = await spec.getWorlds(driver)
    assert.deepStrictEqual(
      actual.map(name => typeof name),
      ['string', 'string'],
    )
  }
  async function switchWorld({input}: {input: {name: string}}) {
    await spec.switchWorld(driver, input.name)
    const actual = await driver.getContext()
    const expected = input.name
    assert.deepStrictEqual(actual, expected)
  }
  async function findElement({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element | null
  }) {
    if (expected === undefined) {
      expected = input.parent
        ? await driver.findElementFromElement(
            extractElementId(input.parent),
            input.selector.using,
            input.selector.value,
          )
        : await driver.findElement(input.selector.using, input.selector.value)
    }
    const element = await spec.findElement(driver, input.selector, input.parent)
    if (element && expected) {
      assert.ok(await equalElements(driver, element, expected))
    }
  }
  async function findElements({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element[]
  }) {
    if (expected === undefined) {
      expected = input.parent
        ? await driver.findElementsFromElement(
            extractElementId(input.parent),
            input.selector.using,
            input.selector.value,
          )
        : await driver.findElements(input.selector.using, input.selector.value)
    }
    const elements = await spec.findElements(driver, input.selector, input.parent)
    assert.strictEqual(elements.length, expected.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await equalElements(driver, element, expected[index]))
    }
  }
  async function setElementText({input}: {input: {element: spec.Element; text: string}}) {
    await driver.elementSendKeys(extractElementId(input.element), 'bla bla')
    await spec.setElementText(driver, input.element, input.text)
    const text = await driver.getElementProperty(extractElementId(input.element), 'value')
    assert.strictEqual(text, input.text)
  }
  async function getWindowSize({legacy = false} = {}) {
    let size
    if (legacy) {
      size = await driver._getWindowSize()
    } else {
      const {width, height} = await driver.getWindowRect()
      size = {width, height}
    }
    const result = await spec.getWindowSize(driver)
    assert.deepStrictEqual(result, size)
  }
  async function setWindowSize({legacy = false, input}: {legacy?: boolean; input: Size}) {
    await spec.setWindowSize(driver, input)
    let rect
    if (legacy) {
      const {x, y} = await driver.getWindowPosition()
      const {width, height} = await driver._getWindowSize()
      rect = {x, y, width, height}
    } else {
      rect = await driver.getWindowRect()
    }
    assert.deepStrictEqual(rect, {x: 0, y: 0, ...input})
  }
  async function setViewportSize({input}: {input: Size}) {
    await spec.setViewportSize(driver, input)
    const size = await driver.executeScript('return {width: window.innerWidth, height: window.innerHeight}', [])
    assert.deepStrictEqual(size, {...input})
  }
  async function getCookies({input}: {input?: {context: boolean}} = {}) {
    const cookie: Cookie = {
      name: 'hello',
      value: 'world',
      domain: input?.context ? '.applitools.github.io' : 'google.com',
      path: '/',
      expiry: Math.floor((Date.now() + 60000) / 1000),
      sameSite: 'Lax',
      httpOnly: true,
      secure: true,
    }
    if (input?.context) {
      await driver.addCookie(cookie)
    } else {
      const request = {...cookie, expires: cookie.expiry}
      await driver.sendCommandAndGetResult('Network.setCookie', request)
    }
    const result = await spec.getCookies(driver, input?.context)
    assert.deepStrictEqual(result, [cookie])
  }
  async function getOrientation({expected}: {expected: string}) {
    const result = await spec.getOrientation(driver)
    assert.strictEqual(result, expected)
  }
  async function getTitle() {
    const expected = await driver.getTitle()
    const result = await spec.getTitle(driver)
    assert.deepStrictEqual(result, expected)
  }
  async function getUrl() {
    const result = await spec.getUrl(driver)
    assert.deepStrictEqual(result, url)
  }
  async function visit() {
    const blank = 'about:blank'
    await spec.visit(driver, blank)
    const actual = await driver.getUrl()
    assert.deepStrictEqual(actual, blank)
    await driver.navigateTo(url)
  }
})
