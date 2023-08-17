import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('lazy load', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('performs lazy load before taking screenshot', async () => {
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/LazyLoad/')

    const core = makeCore({spec})

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'lazyLoad with classic - checkSettings',
        environment: {viewportSize: {width: 800, height: 600}},
      },
    })

    await eyes.check({
      settings: {fully: true, lazyLoad: true, hideScrollbars: true},
    })

    await driver.navigateTo('https://applitools.github.io/demo/TestPages/LazyLoad/insideScrollableArea.html')

    await eyes.check({
      settings: {
        name: 'with scroll root element set',
        fully: true,
        lazyLoad: true,
        hideScrollbars: true,
        scrollRootElement: {type: 'css', selector: '#sre'},
        stitchMode: 'Scroll',
        region: '#sre',
      },
    })

    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
