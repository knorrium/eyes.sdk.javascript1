import assert from 'assert'
import * as spec from '../../src/spec-driver'
import * as utils from '@applitools/utils'

async function equalElements(
  driver: spec.WDIODriver,
  element1: spec.Element | spec.WDIOElement,
  element2: spec.Element | spec.WDIOElement,
): Promise<boolean> {
  try {
    return driver.execute<boolean, (spec.Element | spec.WDIOElement)[]>(
      'return arguments[0] === arguments[1]',
      element1,
      element2,
    )
  } catch {
    return false
  }
}

async function wrap(driver: spec.WDIODriver, element: spec.Element | spec.ShadowRoot) {
  const value: any = utils.types.has(element, 'shadow-6066-11e4-a52e-4f735466cecf')
    ? {'element-6066-11e4-a52e-4f735466cecf': element['shadow-6066-11e4-a52e-4f735466cecf']}
    : element
  return driver.$(value)
}

describe('spec driver', async () => {
  let driver: spec.WDIODriver, destroyDriver: null | (() => Promise<void>)
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('headless desktop', async () => {
    before(async () => {
      ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
      driver = (await spec.toDriver(driver)) as unknown as spec.WDIODriver
      await driver.url(url)
    })

    after(async () => {
      await destroyDriver?.()
      destroyDriver = null
    })

    it('isSecondaryElement(wdio-element)', async () => {
      await isSecondaryElement({input: await driver.$('div'), expected: true})
    })
    it('isSecondaryElement(wrong)', async () => {
      await isSecondaryElement({input: {} as spec.SecondaryElement, expected: false})
    })
    it('isSelector(string)', async () => {
      await isSelector({input: 'div', expected: true})
    })
    it('isSelector(function)', async () => {
      await isSelector({input: (_element: HTMLElement) => null as any, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as spec.Selector, expected: false})
    })
    it('isSecondarySelector(wd-selector)', async () => {
      await isSecondarySelector({input: {using: 'xpath', value: '//div'}, expected: true})
    })
    it('isSecondarySelector(wrong)', async () => {
      await isSecondarySelector({input: {} as spec.SecondarySelector, expected: false})
    })
    it('toElement(element)', async () => {
      await toElement({input: await driver.$('div')})
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
    it('findElement(string)', async function () {
      await findElement({input: {selector: 'div'}})
    })
    it('findElement(string)', async function () {
      const selector = function (_element: HTMLElement) {
        return window.document.querySelector('div')!
      }
      await findElement({input: {selector}})
    })
    it('findElement(string, element-root)', async () => {
      const element = await driver.findElement('css selector', 'div')
      await findElement({input: {selector: 'div', parent: element}})
    })
    it('findElement(string, shadow-root)', async function () {
      if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp') this.skip()
      const element = await driver.findElement('css selector', '#shadow')
      const shadow = await driver.execute<spec.ShadowRoot, spec.Element[]>('return arguments[0].shadowRoot', element)
      await findElement({input: {selector: 'div', parent: shadow}})
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: 'non-existent'}, expected: null})
    })
    it('findElements(string)', async () => {
      await findElements({input: {selector: 'div'}})
    })
    it('findElements(string, element-root)', async () => {
      const element = await driver.findElement('css selector', 'div')
      await findElements({input: {selector: 'div', parent: element}})
    })
    it('findElements(string, shadow-root)', async function () {
      if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp') this.skip()
      const element = await driver.findElement('css selector', '#shadow')
      const shadow = await driver.execute<spec.ShadowRoot, spec.Element[]>('return arguments[0].shadowRoot', element)
      await findElements({input: {selector: 'div', parent: shadow}})
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: 'non-existent'}})
    })
  })

  async function isSecondaryElement({input, expected}: {input: spec.SecondaryElement; expected: boolean}) {
    const result = await spec.isSecondaryElement(input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}: {input: spec.Selector; expected: boolean}) {
    const result = await spec.isSelector(input)
    assert.strictEqual(result, expected)
  }
  async function isSecondarySelector({input, expected}: {input: spec.SecondarySelector; expected: boolean}) {
    const result = await spec.isSecondarySelector(input)
    assert.strictEqual(result, expected)
  }
  async function toElement({input}: {input: spec.SecondaryElement}) {
    const result = spec.toElement(input)
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
    expected?: spec.Element | spec.WDIOElement | null
  }) {
    if (expected === undefined) {
      if (utils.types.has(input.selector, ['using', 'value'])) {
        input.selector = `${input.selector.using}:${input.selector.value}`
      }
      const root = input.parent ? await wrap(driver, input.parent) : driver
      expected = await root.$(input.selector)
    }
    const element = await spec.findElement(driver as unknown as spec.Driver, input.selector, input.parent)
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
    expected?: (spec.Element | spec.WDIOElement)[]
  }) {
    if (expected === undefined) {
      if (utils.types.has(input.selector, ['using', 'value'])) {
        input.selector = `${input.selector.using}:${input.selector.value}`
      }
      const root = input.parent ? await wrap(driver, input.parent) : driver
      expected = await root.$$(input.selector)
    }
    const elements = await spec.findElements(driver as unknown as spec.Driver, input.selector, input.parent)
    assert.strictEqual(elements.length, expected!.length)
    for (const [index, element] of elements.entries()) {
      assert.ok(await equalElements(driver, element, expected![index]))
    }
  }
})
