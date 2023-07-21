import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('wait before capture', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome', headless: false})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('waits before taking snapshot', async () => {
    await driver.url('https://applitools.github.io/demo/TestPages/waitBeforeCapture/')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'waitBeforeCapture with layoutbreakpoints - config',
        environment: {
          viewportSize: {width: 800, height: 600},
        },
      },
    })
    await eyes.check({
      settings: {
        waitBeforeCapture: 1500,
        layoutBreakpoints: {breakpoints: true},
        renderers: [{name: 'chrome', width: 1000, height: 600}],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })

  it('waits before taking snapshot when resize fail', async () => {
    await driver.url('https://applitools.github.io/demo/TestPages/waitBeforeCapture/smallViewportSize')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'should show smurfs with small viewport size',
        environment: {
          viewportSize: {width: 800, height: 600},
        },
      },
    })
    await eyes.check({
      settings: {
        waitBeforeCapture: 1500,
        layoutBreakpoints: {breakpoints: true},
        renderers: [{name: 'chrome', width: 390, height: 400}],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
