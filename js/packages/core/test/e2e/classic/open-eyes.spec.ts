import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('open eyes classic', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('should preserve original frame after opening', async () => {
    const core = makeCore({spec})

    await driver.url('https://applitools.github.io/demo/TestPages/FramesTestPage/')

    const frame = await driver.$('[name="frame1"]')
    await driver.switchToFrame(frame)

    const frameUrlBaseline = await driver.execute(`return location.href`)

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core e2e',
        testName: 'classic - should preserve original frame after opening',
        environment: {viewportSize: {width: 700, height: 460}},
      },
    })

    const frameUrlAfterOpenEyes = await driver.execute(`return location.href`)

    assert.strictEqual(
      frameUrlBaseline,
      frameUrlAfterOpenEyes,
      'frame url baseline should be equals to frame url after open eyes',
    )

    await eyes.close()
    await eyes.getResults()
  })
})
