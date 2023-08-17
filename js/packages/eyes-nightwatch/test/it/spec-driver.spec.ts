import * as Nightwatch from 'nightwatch'
import * as spec from '../../src/spec-driver'
import * as utils from '@applitools/utils'
import assert from 'assert'

function extractElementId(element: any) {
  return (
    element['shadow-6066-11e4-a52e-4f735466cecf'] || element['element-6066-11e4-a52e-4f735466cecf'] || element.ELEMENT
  )
}
async function extractShadowRoot(driver: spec.NWDriver, element: spec.Element | spec.NWElement) {
  const shadow = await driver.execute<any, any>('return arguments[0].shadowRoot', [element])
  return {'shadow-6066-11e4-a52e-4f735466cecf': shadow.id_}
}
async function equalElements(
  driver: spec.NWDriver,
  element1: spec.Element | spec.NWElement,
  element2: spec.Element | spec.NWElement,
): Promise<boolean> {
  try {
    return await driver.execute<(spec.Element | spec.NWElement)[], boolean>('return arguments[0] === arguments[1]', [
      element1,
      element2,
    ])
  } catch {
    return false
  }
}

describe('spec driver', async () => {
  let driver: spec.NWDriver, destroyDriver: null | (() => Promise<void>)
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('headless desktop', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      // eslint-disable-next-line
      await driver.url(url)
    })

    after(async () => {
      await destroyDriver?.()
      destroyDriver = null
    })

    it('isSecondaryDriver(nw-driver)', async () => {
      await isSecondaryDriver({input: driver, expected: true})
    })
    it('isSecondaryDriver(wrong)', async () => {
      await isSecondaryDriver({input: {} as spec.SecondaryDriver, expected: false})
    })
    it('isSecondaryElement(nw-element)', async () => {
      const element = await driver.execute<spec.SecondaryElement>('return document.querySelector("div")')
      await isSecondaryElement({input: element, expected: true})
    })
    it('isSecondaryElement(wrong)', async () => {
      await isSecondaryElement({input: {} as spec.SecondaryElement, expected: false})
    })
    it('isSelector(wd-selector)', async () => {
      await isSelector({input: {using: 'xpath', value: '//div'}, expected: true})
    })
    it('isSelector(nw-selector)', async () => {
      await isSelector({input: {locateStrategy: 'css selector', selector: 'div'}, expected: true})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector(by)', async () => {
      const {By} = require('selenium-webdriver')
      await isSelector({input: By.xpath('//div'), expected: true})
    })
    it('isSelector(relative-by)', async () => {
      const {locateWith, By} = require('selenium-webdriver')
      await isSelector({input: locateWith({css: 'div'}).toLeftOf(By.css('button')), expected: true})
    })
    it('isSelector(by-hash)', async () => {
      await isSelector({input: {xpath: '//div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('toDriver(nw-driver)', async () => {
      await toDriver({input: driver})
    })
    it('toElement(nw-element)', async () => {
      const element = await driver.execute<spec.SecondaryElement>('return document.querySelector("div")')
      await toElement({input: element})
    })
    it('toElement(nw-response-element)', async () => {
      await new Promise((resolve, reject) => {
        driver.findElement('css selector', 'div', element => {
          !element.status ? toElement({input: element}).then(resolve, reject) : reject(element.value)
        })
      })
    })
    it('toSimpleCommonSelector(nw-selector)', async () => {
      await toSimpleCommonSelector({
        input: {locateStrategy: 'css selector', selector: '.class'},
        expected: {type: 'css', selector: '.class'},
      })
    })
    it('toSimpleCommonSelector(string)', async () => {
      await toSimpleCommonSelector({input: '.class', expected: {selector: '.class'}})
    })
    it('toSimpleCommonSelector(common-selector)', async () => {
      await toSimpleCommonSelector({
        input: {type: 'selector', selector: '.class'},
        expected: {type: 'selector', selector: '.class'},
      })
    })
    it('findElement(nw-selector)', async () => {
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'div'}}})
    })
    it('findElement(string)', async () => {
      await findElement({input: {selector: 'div'}})
    })
    it('findElement(by)', async () => {
      const {By} = require('nightwatch/node_modules/selenium-webdriver')
      await findElement({input: {selector: By.css('div')}})
    })
    it('findElement(relative-by)', async () => {
      const {locateWith, By} = require('nightwatch/node_modules/selenium-webdriver')
      await findElement({input: {selector: locateWith(By.css('div')).toLeftOf(By.css('iframe'))}})
    })
    it('findElement(nw-selector, element-root)', async () => {
      const element = await driver.findElement('css selector', 'div')
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'div'}, parent: element}})
    })
    it('findElement(nw-selector, shadow-root)', async () => {
      const element = await driver.findElement('css selector', '#shadow')
      const shadow = await extractShadowRoot(driver, element)
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'div'}, parent: shadow}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'non-existent'}}, expected: null})
    })
    it('findElements(nw-selector)', async () => {
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'div'}}})
    })
    it('findElements(string)', async () => {
      await findElements({input: {selector: 'div'}})
    })
    it('findElements(by)', async () => {
      const {By} = require('nightwatch/node_modules/selenium-webdriver')
      await findElements({input: {selector: By.css('div')}})
    })
    it('findElements(relative-by)', async () => {
      const {locateWith, By} = require('nightwatch/node_modules/selenium-webdriver')
      await findElements({input: {selector: locateWith(By.css('div')).toLeftOf(By.css('iframe'))}})
    })
    it('findElements(nw-selector, element-root)', async () => {
      const element = await driver.findElement('css selector', 'div')
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'div'}, parent: element}})
    })
    it('findElements(nw-selector, shadow-root)', async () => {
      const element = await driver.findElement('css selector', '#shadow')
      const shadow = await extractShadowRoot(driver, element)
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'div'}, parent: shadow}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'non-existent'}}})
    })
  })

  async function isSecondaryDriver({input, expected}: {input: spec.SecondaryDriver; expected: boolean}) {
    const result = await spec.isSecondaryDriver(input)
    assert.strictEqual(result, expected)
  }
  async function isSecondaryElement({input, expected}: {input: spec.SecondaryElement; expected: boolean}) {
    const result = await spec.isSecondaryElement(input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}: {input: spec.Selector; expected: boolean}) {
    const result = await spec.isSelector(input)
    assert.strictEqual(result, expected)
  }
  async function toDriver({input}: {input: spec.SecondaryDriver}) {
    const transformedDriver = await spec.toDriver(input)
    const result = await transformedDriver.getUrl()
    const expected = await driver.url()
    assert.deepStrictEqual(result, expected)
  }
  async function toElement({input}: {input: spec.SecondaryElement}) {
    const result = await spec.toElement(input)
    assert.deepStrictEqual(spec.isElement(result), true)
  }
  async function toSimpleCommonSelector({
    input,
    expected,
  }: {
    input: spec.Selector | {type: string; selector: string} | string | null
    expected: {type?: string; selector: string} | string | null
  }) {
    assert.deepStrictEqual(spec.toSimpleCommonSelector(input as spec.Selector), expected)
  }
  async function findElement({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element | spec.ShadowRoot}
    expected?: spec.Element | spec.NWElement | null
  }) {
    if (expected === undefined) {
      if (utils.types.has(input.selector, 'selector') && input.selector.locateStrategy) {
        expected = input.parent
          ? ((await driver.elementIdElement(
              extractElementId(input.parent),
              input.selector.locateStrategy,
              input.selector.selector,
            )) as any)
          : await driver.element(input.selector.locateStrategy, input.selector.selector)
      } else {
        expected = await driver.findElement(input.selector as Nightwatch.Definition)
      }
    }

    const element = await spec.findElement(await spec.toDriver(driver), input.selector, input.parent)
    if (element && expected) {
      assert.ok(await equalElements(driver, element, expected))
    } else if (element || expected) {
      assert.fail()
    }
  }
  async function findElements({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element | spec.ShadowRoot}
    expected?: (spec.Element | spec.NWElement)[]
  }) {
    if (expected === undefined) {
      if (utils.types.has(input.selector, 'selector') && input.selector.locateStrategy) {
        expected = input.parent
          ? ((await driver.elementIdElements(
              extractElementId(input.parent),
              input.selector.locateStrategy,
              input.selector.selector,
            )) as any)
          : // TODO is is `any` here because of wrong typings in `@types/nightwatch`
            await driver.elements(input.selector.locateStrategy, input.selector.selector)
      } else {
        expected = await driver.findElements(input.selector as Nightwatch.Definition)
      }
    }
    const elements = await spec.findElements(await spec.toDriver(driver), input.selector, input.parent)
    assert.strictEqual(elements.length, expected!.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await equalElements(driver, element, expected![index]))
    }
  }
})
