import {makeCore} from '../../../src/classic/core'
import {By} from 'selenium-webdriver'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'

describe('openEyes classic', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('should preserve original frame after opening', async () => {
    const core = makeCore<spec.Driver, spec.Driver, spec.Element, spec.Selector>({spec})

    await driver.get('https://applitools.github.io/demo/TestPages/FramesTestPage/')

    const frame = await driver.findElement(By.css('[name="frame1"]'))
    await driver.switchTo().frame(frame)

    const frameUrlBaseline = await driver.executeScript(`return location.href`)

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core e2e',
        testName: 'classic - should preserve original frame after opening',
        environment: {viewportSize: {width: 700, height: 460}},
      },
    })

    const frameUrlAfterOpenEyes = await driver.executeScript(`return location.href`)

    assert.strictEqual(
      frameUrlBaseline,
      frameUrlAfterOpenEyes,
      'frame url baseline should be equals to frame url after open eyes',
    )

    await eyes.close({})
  })
})
