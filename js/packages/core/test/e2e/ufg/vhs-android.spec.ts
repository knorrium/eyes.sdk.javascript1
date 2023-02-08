import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('vhs - android', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      device: 'Pixel 3 XL duckduckgo',
      app: 'https://applitools.jfrog.io/artifactory/Examples/duckduckgo-5.87.0-play-debug.apk',
    })
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('works', async () => {
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'native ufg android',
      },
    })
    await eyes.check({
      settings: {
        waitBeforeCapture: 1500,
        renderers: [{androidDeviceInfo: {deviceName: 'Pixel 4 XL', version: 'latest'}}],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
