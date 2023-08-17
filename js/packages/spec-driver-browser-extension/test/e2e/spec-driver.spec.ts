import type {Size} from '@applitools/utils'
import type {CommonSelector} from '@applitools/driver'
import type {Page, Worker} from 'playwright'
import type {Browser} from 'webextension-polyfill'
import type * as extSpec from '../../src/spec-driver'
import assert from 'assert'
import * as path from 'path'
import * as pwSpec from '@applitools/spec-driver-playwright'

declare global {
  const spec: typeof extSpec
  const refer: any
  const browser: Browser
}

describe('spec driver', async () => {
  let driver: any, serviceWorker: Worker, contentPage: Page, destroyPage: () => Promise<void>
  const url = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'

  describe('onscreen desktop (@chrome)', async () => {
    before(async () => {
      const extPath = path.resolve(process.cwd(), 'test/fixtures/extension/dist')
      ;[contentPage, destroyPage] = await pwSpec.build({browser: 'chromium', extension: extPath})

      serviceWorker =
        contentPage.context().serviceWorkers()[0] || (await contentPage.context().waitForEvent('serviceworker'))

      await contentPage.goto(url)

      contentPage.on('console', async msg => {
        for (let i = 0; i < msg.args().length; ++i)
          // eslint-disable-next-line no-console
          console.log(`${i}: ${JSON.stringify(await msg.args()[i].jsonValue())}`)
      })

      const [activeTab] = await serviceWorker.evaluate(() => browser.tabs.query({active: true}))
      driver = {windowId: activeTab.windowId, tabId: activeTab.id}
    })

    after(async () => {
      await destroyPage()
    })

    it('isDriver(driver)', async () => {
      await isDriver({input: driver, expected: true})
    })
    it('isDriver(wrong)', async () => {
      await isDriver({input: {} as extSpec.Driver, expected: false})
    })
    it('isElement(element)', async () => {
      await isElement({input: {'applitools-ref-id': 'element-id'}, expected: true})
    })
    it('isElement(wrong)', async () => {
      await isElement({input: {} as extSpec.Element, expected: false})
    })
    it('isSelector({type, selector})', async () => {
      await isSelector({input: {type: 'css', selector: 'div'}, expected: true})
    })
    it('isSelector(wrong)', async () => {
      await isSelector({input: {} as extSpec.Selector, expected: false})
    })
    it('toSelector({type, selector})', async () => {
      await toSelector({
        input: {type: 'xpath', selector: '//element'},
        expected: {type: 'xpath', selector: '//element'},
      })
    })
    it('toSelector(string)', async () => {
      await toSelector({input: 'div', expected: {type: 'css', selector: 'div'}})
    })
    it('toSelector(common-selector)', async () => {
      await toSelector({
        input: {selector: {type: 'xpath', selector: '//element'}},
        expected: {type: 'xpath', selector: '//element'},
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
    it('executeScript(script, args)', async () => {
      await executeScript()
    })
    it('findElement(selector)', async () => {
      await findElement({input: {selector: {type: 'css', selector: 'h1'}}})
    })
    it('findElement(selector, parent-element)', async () => {
      await findElement({
        input: {selector: {type: 'css', selector: 'div'}, parent: (await contentPage.$('#stretched'))!},
      })
    })
    it('findElement(non-existent)', async () => {
      await findElement({input: {selector: {type: 'css', selector: 'non-existent'}}, expected: null})
    })
    it('findElements(selector)', async () => {
      await findElements({input: {selector: {type: 'css', selector: 'div'}}})
    })
    it('findElements(string, parent-element)', async () => {
      await findElements({
        input: {selector: {type: 'css', selector: 'div'}, parent: (await contentPage.$('#stretched'))!},
      })
    })
    it('findElements(non-existent)', async () => {
      await findElements({input: {selector: {type: 'css', selector: 'non-existent'}}, expected: []})
    })
    it('getWindowSize()', async () => {
      await getWindowSize()
    })
    it('setWindowSize({width, height})', async () => {
      await setWindowSize({input: {width: 501, height: 502}})
    })
    it('getCookies()', async () => {
      await getCookies()
    })
    it('getTitle()', async () => {
      await getTitle()
    })
    it('getUrl()', async () => {
      await getUrl()
    })
  })

  async function isDriver({input, expected}: {input: extSpec.Driver; expected: boolean}) {
    const result = await serviceWorker.evaluate(driver => spec.isDriver(driver), input)
    assert.strictEqual(result, expected)
  }
  async function isElement({input, expected}: {input: extSpec.Element; expected: boolean}) {
    const result = await serviceWorker.evaluate(element => spec.isElement(element), input)
    assert.strictEqual(result, expected)
  }
  async function isSelector({input, expected}: {input: extSpec.Selector; expected: boolean}) {
    const result = await serviceWorker.evaluate(selector => spec.isSelector(selector), input)
    assert.strictEqual(result, expected)
  }
  async function toSelector({input, expected}: {input: CommonSelector<extSpec.Selector>; expected: extSpec.Selector}) {
    const result = await serviceWorker.evaluate(selector => spec.toSelector(selector), input)
    assert.deepStrictEqual(result, expected || input)
  }
  async function mainContext() {
    const mainContext = await serviceWorker.evaluate(([driver]) => spec.mainContext(driver), [driver])
    assert.strictEqual(mainContext.frameId, 0)
  }
  async function parentContext() {
    const nestedFrame = await serviceWorker.evaluate(
      async ([driver]) => {
        const frames = await browser.webNavigation.getAllFrames({tabId: driver.tabId})
        return frames[frames.length - 1]
      },
      [driver],
    )
    const parentContext = await serviceWorker.evaluate(
      ([context]) => spec.parentContext(context),
      [{...driver, frameId: nestedFrame.frameId}],
    )
    assert.deepStrictEqual(parentContext, {...driver, frameId: nestedFrame.parentFrameId})
  }
  async function childContext() {
    const childFrame = await serviceWorker.evaluate(
      async ([driver]) => {
        const frames = await browser.webNavigation.getAllFrames({tabId: driver.tabId})
        return frames.find(
          (frame: any) => frame.url === 'https://applitools.github.io/demo/TestPages/FramesTestPage/frame2.html',
        )
      },
      [driver],
    )
    const childContext = await serviceWorker.evaluate(
      async ([context]) => {
        const [{result: element}] = await browser.scripting.executeScript({
          target: {tabId: context.tabId, frameIds: [context.frameId]},
          func: () => refer.ref(document.querySelector('[src="./frame2.html"]')), // eslint-disable-line no-undef
        })
        return spec.childContext(context, element)
      },
      [{...driver, frameId: 0}],
    )
    assert.deepStrictEqual(childContext.frameId, childFrame!.frameId)
  }
  async function executeScript() {
    const arg = {
      num: 0,
      str: 'string',
      obj: {key: 'value', obj: {key: 0}},
      arr: [0, 1, 2, {key: 3}],
    }

    const {...result1} = await serviceWorker.evaluate(
      ([driver, arg]) =>
        spec.executeScript(
          driver,
          arg => {
            return {...arg}
          },
          arg,
        ),
      [driver, arg],
    )

    assert.deepStrictEqual(result1, arg)
    // assert.ok(el1['applitools-ref-id'])

    const {tagName, ...result2} = await serviceWorker.evaluate(
      ([driver, arg]) =>
        spec.executeScript(driver, arg => ({...arg, tagName: document.querySelector('body')!.tagName}), arg),
      [driver, {...arg}],
    )

    assert.deepStrictEqual(result2, arg)
    // assert.ok(el2['applitools-ref-id'])
    assert.strictEqual(tagName, 'BODY')
    // assert.notDeepStrictEqual(el1, el2)

    assert.rejects(
      serviceWorker.evaluate(
        ([driver]) =>
          spec.executeScript(driver, () => {
            throw new Error('blabla')
          }),
        [driver],
      ),
      err => err.message === 'blabla',
    )
  }
  async function findElement({
    input,
    expected,
  }: {
    input: {selector: extSpec.Selector; parent?: pwSpec.Element}
    expected?: pwSpec.Element | null
  }) {
    const root = input.parent || contentPage
    expected = expected === undefined ? await root.$(input.selector.selector) : expected
    const transformedInput = {selector: input.selector} as {selector: extSpec.Selector; parent?: extSpec.Element}
    if (input.parent) {
      const parentElementKey = await input.parent.evaluate<string, HTMLElement>(
        element => (element.dataset.key = 'parent-element-key'),
      )
      transformedInput.parent = (await serviceWorker.evaluate(
        ([driver, selector]) => spec.findElement(driver, selector),
        [driver, {type: 'css', selector: `[data-key="${parentElementKey}"]`}],
      ))!
    }
    const element = await serviceWorker.evaluate(
      ([driver, input]) => spec.findElement(driver, input.selector, input.parent),
      [driver, transformedInput],
    )
    if (element !== expected) {
      const elementKey = await expected!.evaluate<string, HTMLElement>(element => (element.dataset.key = 'element-key'))
      const isCorrectElement = await serviceWorker.evaluate(
        async ([context, element, elementKey]) => {
          const [{result}] = await browser.scripting.executeScript({
            target: {tabId: context.tabId, frameIds: [context.frameId]},
            func: (element, elementKey) => refer.deref(element).dataset.key === elementKey,
            args: [element, elementKey],
          })
          return result
        },
        [{...driver, frameId: 0}, element, elementKey],
      )
      assert.ok(isCorrectElement)
    }
  }
  async function findElements({
    input,
    expected,
  }: {
    input: {selector: extSpec.Selector; parent?: pwSpec.Element}
    expected?: pwSpec.Element[]
  }) {
    const root = input.parent ?? contentPage
    expected = expected === undefined ? await root.$$(input.selector.selector) : expected
    const transformedInput = {selector: input.selector} as {selector: extSpec.Selector; parent?: extSpec.Element}
    if (input.parent) {
      const parentElementKey = await input.parent.evaluate<string, HTMLElement>(
        element => (element.dataset.key = 'parent-element-key'),
      )
      transformedInput.parent = (await serviceWorker.evaluate(
        ([driver, selector]) => spec.findElement(driver, selector),
        [driver, {type: 'css', selector: `[data-key="${parentElementKey}"]`}],
      ))!
    }
    const elements = await serviceWorker.evaluate(
      ([driver, input]) => spec.findElements(driver, input.selector, input.parent),
      [driver, transformedInput],
    )
    assert.strictEqual(elements.length, expected.length)
    for (const [index, expectedElement] of expected.entries()) {
      const elementKey = await expectedElement.evaluate<string, HTMLElement>(
        element => (element.dataset.key = 'element-key'),
      )
      const isCorrectElement = await serviceWorker.evaluate(
        async ([context, element, elementKey]) => {
          const [{result}] = await browser.scripting.executeScript({
            target: {tabId: context.tabId, frameIds: [context.frameId]},
            func: (element, elementKey) => refer.deref(element).dataset.key === elementKey, // eslint-disable-line no-undef
            args: [element, elementKey],
          })
          return result
        },
        [{...driver, frameId: 0}, elements[index], elementKey],
      )
      assert.ok(isCorrectElement)
    }
  }
  async function getWindowSize() {
    const expected = await contentPage.evaluate(() => ({width: window.outerWidth, height: window.outerHeight}))
    const result = await serviceWorker.evaluate(([driver]) => spec.getWindowSize(driver), [driver])
    assert.deepStrictEqual(result, expected)
  }
  async function setWindowSize({input}: {input: Size}) {
    await serviceWorker.evaluate(([driver, size]) => spec.setWindowSize(driver, size), [driver, input])
    const actual = await contentPage.evaluate(() => ({width: window.outerWidth, height: window.outerHeight}))
    assert.deepStrictEqual(actual, input)
  }
  async function getCookies() {
    const cookie = {
      name: 'hello',
      value: 'world',
      domain: 'google.com',
      path: '/',
      expiry: Math.floor((Date.now() + 60000) / 1000),
      httpOnly: true,
      secure: true,
      sameSite: 'Lax' as const,
    }
    await contentPage.context().addCookies([{...cookie, expires: cookie.expiry}])
    const cookies = await serviceWorker.evaluate(driver => spec.getCookies(driver), driver)
    assert.deepStrictEqual(cookies, [cookie])
  }
  async function getTitle() {
    const expected = await contentPage.title()
    const result = await serviceWorker.evaluate(async ([driver]) => spec.getTitle(driver), [driver])
    assert.deepStrictEqual(result, expected)
  }
  async function getUrl() {
    const result = await serviceWorker.evaluate(async ([driver]) => spec.getUrl(driver), [driver])
    assert.deepStrictEqual(result, url)
  }
})
