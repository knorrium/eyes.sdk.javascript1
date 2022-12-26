import 'mocha'
import {type Definition} from 'nightwatch'
import * as spec from '../../src/spec-driver'
import * as utils from '@applitools/utils'
import assert from 'assert'

function extractElementId(element: any) {
  return (
    element['element-6066-11e4-a52e-4f735466cecf'] || element['shadow-6066-11e4-a52e-4f735466cecf'] || element.ELEMENT
  )
}

async function equalElements(driver: spec.Driver, element1: spec.Element, element2: spec.Element): Promise<boolean> {
  try {
    let result = await driver.execute<boolean>('return arguments[0] === arguments[1]', [element1, element2])
    if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
      result = (result as any).value
    }
    return result
  } catch {
    return false
  }
}

describe('spec driver', async () => {
  let driver: spec.Driver, destroyDriver: null | (() => Promise<void>)
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('headless desktop', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      await driver.url(url)
    })

    after(async () => {
      await destroyDriver?.()
      destroyDriver = null
    })

    it('isDriver(nw-driver)', async () => {
      await isDriver({input: driver, expected: true})
    })
    it('isDriver(wd-driver)', async () => {
      await isDriver({input: spec.transformDriver(driver), expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {} as spec.Driver, expected: false})
    })
    it('isElement(nw-element/wd-element)', async () => {
      let element = await driver.element('css selector', 'div')
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
        element = (element as any).value
      }
      await isElement({input: element, expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {} as spec.Element, expected: false})
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
    it('isSelector(by)', async function () {
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) return this.skip()
      const {By} = require('selenium-webdriver')
      await isSelector({input: By.xpath('//div'), expected: true})
    })
    it('isSelector(relative-by)', async function () {
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) return this.skip()
      const {locateWith, By} = require('selenium-webdriver')
      await isSelector({input: locateWith({css: 'div'}).toLeftOf(By.css('button')), expected: true})
    })
    it('isSelector(by-hash)', async () => {
      await isSelector({input: {xpath: '//div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('transformDriver(driver)', async () => {
      await transformDriver({input: driver})
    })
    it('transformElement(element)', async () => {
      await transformElement({input: await driver.element('css selector', 'div')})
    })
    it('transformElement(response-element)', async () => {
      await new Promise((resolve, reject) => {
        driver.element('css selector', 'div', element => {
          !element.status ? transformElement({input: element}).then(resolve, reject) : reject(element.value)
        })
      })
    })
    it('untransformSelector(nw-selector)', async () => {
      await untransformSelector({
        input: {locateStrategy: 'css selector', selector: '.class'},
        expected: {type: 'css', selector: '.class'},
      })
    })
    it('untransformSelector(string)', async () => {
      await untransformSelector({input: '.class', expected: '.class'})
    })
    it('untransformSelector(common-selector)', async () => {
      await untransformSelector({
        input: {type: 'selector', selector: '.class'},
        expected: {type: 'selector', selector: '.class'},
      })
    })
    it('findElement(nw-selector)', async () => {
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'div'}}})
    })
    it('findElement(string)', async function () {
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) return this.skip()
      await findElement({input: {selector: 'div'}})
    })
    it('findElement(by)', async function () {
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) return this.skip()
      const {By} = require('selenium-webdriver')
      await findElement({input: {selector: By.css('div')}})
    })
    it('findElement(relative-by)', async function () {
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) return this.skip()
      const {locateWith, By} = require('selenium-webdriver')
      await findElement({input: {selector: locateWith(By.css('div')).toLeftOf(By.css('iframe'))}})
    })
    it('findElement(nw-selector, element-root)', async () => {
      let element = await driver.element('css selector', 'div')
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
        element = (element as any).value
      }
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'div'}, parent: element}})
    })
    it('findElement(nw-selector, shadow-root)', async () => {
      let element = await driver.element('css selector', '#shadow')
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
        element = (element as any).value
      }
      let shadow = await driver.execute<any>('return arguments[0].shadowRoot', [element])
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
        shadow = (shadow as any).value
      }
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'div'}, parent: shadow}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: {locateStrategy: 'css selector', selector: 'non-existent'}}, expected: null})
    })
    it('findElements(nw-selector)', async () => {
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'div'}}})
    })
    it('findElements(string)', async function () {
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) return this.skip()
      await findElements({input: {selector: 'div'}})
    })
    it('findElements(by)', async function () {
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) return this.skip()
      const {By} = require('selenium-webdriver')
      await findElements({input: {selector: By.css('div')}})
    })
    it('findElements(relative-by)', async function () {
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) return this.skip()
      const {locateWith, By} = require('selenium-webdriver')
      await findElements({input: {selector: locateWith(By.css('div')).toLeftOf(By.css('iframe'))}})
    })
    it('findElements(nw-selector, element-root)', async () => {
      let element = await driver.element('css selector', 'div')
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
        element = (element as any).value
      }
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'div'}, parent: element}})
    })
    it('findElements(nw-selector, shadow-root)', async () => {
      let element = await driver.element('css selector', '#shadow')
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
        element = (element as any).value
      }
      let shadow = await driver.execute<any>('return arguments[0].shadowRoot', [element])
      if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) {
        shadow = (shadow as any).value
      }
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'div'}, parent: shadow}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: {locateStrategy: 'css selector', selector: 'non-existent'}}})
    })
  })

  async function isDriver({input, expected}: {input: spec.Driver | spec.WDDriver; expected: boolean}) {
    const result = await spec.isDriver(input)
    assert.strictEqual(result, expected)
  }
  async function isElement({input, expected}: {input: spec.Element | spec.WDElement; expected: boolean}) {
    const result = await spec.isElement(input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}: {input: spec.Selector | spec.WDSelector; expected: boolean}) {
    const result = await spec.isSelector(input)
    assert.strictEqual(result, expected)
  }
  async function transformDriver({input}: {input: spec.Driver}) {
    const transformedDriver = spec.transformDriver(input)
    const result = await transformedDriver.getUrl()
    const expected = await transformedDriver.getUrl()
    assert.deepStrictEqual(result, expected)
  }
  async function transformElement({input}: {input: spec.Element | spec.ResponseElement}) {
    const result = spec.transformElement(input)
    assert.deepStrictEqual(spec.isElement(result), true)
  }
  async function untransformSelector({
    input,
    expected,
  }: {
    input: spec.Selector | {type: string; selector: string} | string | null
    expected: {type: string; selector: string} | string | null
  }) {
    assert.deepStrictEqual(spec.untransformSelector(input as spec.Selector), expected)
  }
  async function findElement({
    input,
    expected,
  }: {
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element | null
  }) {
    if (expected === undefined) {
      if (utils.types.has(input.selector, 'selector') && input.selector.locateStrategy) {
        expected = input.parent
          ? ((await driver.elementIdElement(
              extractElementId(input.parent),
              input.selector.locateStrategy,
              input.selector.selector,
            )) as any)
          : // TODO is is `any` here because of wrong typings in `@types/nightwatch`
            await driver.element(input.selector.locateStrategy, input.selector.selector)
      } else {
        expected = await driver.findElement(input.selector as Definition)
      }
    }
    if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) expected = (expected as any)?.value
    const element = await spec.findElement(spec.transformDriver(driver), input.selector, input.parent)
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
    input: {selector: spec.Selector; parent?: spec.Element}
    expected?: spec.Element[]
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
        expected = await driver.findElements(input.selector as Definition)
      }
    }
    if (Number(process.env.APPLITOOLS_NIGHTWATCH_MAJOR_VERSION) < 2) expected = (expected as any)?.value
    const elements = await spec.findElements(spec.transformDriver(driver), input.selector, input.parent)
    assert.strictEqual(elements.length, expected!.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await equalElements(driver, element, expected![index]))
    }
  }
})
