import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-puppeteer'
import {getTestInfo} from '@applitools/test-utils'
import assert from 'assert'

describe('layout breakpoints', () => {
  let page: spec.Driver, destroyPage: () => Promise<void>

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyPage?.()
  })

  it('refreshes the page after resize in check', async () => {
    await page.goto('https://applitools.github.io/demo/TestPages/OnLoad/')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'layoutbreakpoints refresh',
      },
    })

    await eyes.check({
      settings: {
        layoutBreakpoints: {breakpoints: true, reload: true},
        renderers: [
          {name: 'chrome', width: 400, height: 600},
          {name: 'chrome', width: 1000, height: 600},
        ],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()

    assert.strictEqual(result.status, 'Passed')
  })

  it('refreshes the page after resize in checkAndClose', async () => {
    await page.goto('https://applitools.github.io/demo/TestPages/OnLoad/')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'layoutbreakpoints refresh',
      },
    })

    await eyes.checkAndClose({
      settings: {
        layoutBreakpoints: {breakpoints: true, reload: true},
        renderers: [
          {name: 'chrome', width: 400, height: 600},
          {name: 'chrome', width: 1000, height: 600},
        ],
      },
    })
    const [result] = await eyes.getResults()

    assert.strictEqual(result.status, 'Passed')
  })

  it('refreshes the page after resize in check with coded regions', async () => {
    await page.goto('https://applitools.github.io/demo/TestPages/OnLoad/')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'layoutbreakpoints refresh with coded regions',
      },
    })

    await eyes.check({
      settings: {
        layoutBreakpoints: {breakpoints: true, reload: true},
        renderers: [
          {name: 'chrome', width: 400, height: 600},
          {name: 'chrome', width: 1000, height: 600},
        ],
        strictRegions: [{region: '#target'}],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})

    const results = await eyes.getResults()
    const [info1, info2] = await Promise.all(results.map(result => getTestInfo(result, process.env.APPLITOOLS_API_KEY)))
    const expectedRegions1 = [{left: 8, top: 8, width: 384, height: 18, regionId: '#target'}]
    const expectedRegions2 = [{left: 8, top: 8, width: 984, height: 18, regionId: '#target'}]
    assert.deepStrictEqual(info1.actualAppOutput[0].imageMatchSettings.strict, expectedRegions1)
    assert.deepStrictEqual(info2.actualAppOutput[0].imageMatchSettings.strict, expectedRegions2)
    assert.strictEqual(results[0].status, 'Passed')
    assert.strictEqual(results[1].status, 'Passed')
  })

  it('refreshes the page after resize in checkAndClose with coded regions', async () => {
    await page.goto('https://applitools.github.io/demo/TestPages/OnLoad/')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'layoutbreakpoints refresh with coded regions',
      },
    })

    await eyes.checkAndClose({
      settings: {
        layoutBreakpoints: {breakpoints: true, reload: true},
        renderers: [
          {name: 'chrome', width: 400, height: 600},
          {name: 'chrome', width: 1000, height: 600},
        ],
        strictRegions: [{region: '#target'}],
      },
    })

    const results = await eyes.getResults()
    const [info1, info2] = await Promise.all(results.map(result => getTestInfo(result, process.env.APPLITOOLS_API_KEY)))
    const expectedRegions1 = [{left: 8, top: 8, width: 384, height: 18, regionId: '#target'}]
    const expectedRegions2 = [{left: 8, top: 8, width: 984, height: 18, regionId: '#target'}]
    assert.deepStrictEqual(info1.actualAppOutput[0].imageMatchSettings.strict, expectedRegions1)
    assert.deepStrictEqual(info2.actualAppOutput[0].imageMatchSettings.strict, expectedRegions2)
    assert.strictEqual(results[0].status, 'Passed')
    assert.strictEqual(results[1].status, 'Passed')
  })

  it('refreshes the page after resize in check with target region', async () => {
    await page.goto('https://applitools.github.io/demo/TestPages/OnLoad/')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'layoutbreakpoints refresh with target region',
      },
    })

    await eyes.check({
      settings: {
        layoutBreakpoints: {breakpoints: true, reload: true},
        renderers: [
          {name: 'chrome', width: 400, height: 600},
          {name: 'chrome', width: 1000, height: 600},
        ],
        region: '#target',
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})

    const result = await eyes.getResults()
    assert.strictEqual(result[0].status, 'Passed')
    assert.strictEqual(result[1].status, 'Passed')
  })

  it('refreshes the page after resize in checkAndClose with target region', async () => {
    await page.goto('https://applitools.github.io/demo/TestPages/OnLoad/')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'layoutbreakpoints refresh with target region',
      },
    })

    await eyes.checkAndClose({
      settings: {
        layoutBreakpoints: {breakpoints: true, reload: true},
        renderers: [
          {name: 'chrome', width: 400, height: 600},
          {name: 'chrome', width: 1000, height: 600},
        ],
        region: '#target',
      },
    })

    const result = await eyes.getResults()
    assert.strictEqual(result[0].status, 'Passed')
    assert.strictEqual(result[1].status, 'Passed')
  })
})
