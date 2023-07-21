import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('default scroll root element', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('uses html or body as default scroll root elements', async () => {
    const core = makeCore({spec})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'scrollingElement',
        testName: 'test scrollingElement',
      },
    })
    await driver.url('https://applitools.github.io/demo/TestPages/ScrollingElement/body.html')
    await eyes.check({settings: {name: 'body scrolling element', fully: true, hideScrollbars: true}})
    await driver.url('https://applitools.github.io/demo/TestPages/ScrollingElement/html.html')
    await eyes.check({settings: {name: 'html scrolling element', fully: true, hideScrollbars: true}})
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
