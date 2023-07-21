import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-puppeteer'
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
})
