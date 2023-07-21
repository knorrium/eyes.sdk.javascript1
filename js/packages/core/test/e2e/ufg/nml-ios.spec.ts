import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('nml - ios (@sauce)', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      device: 'iPhone 12',
      app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp-instrumented-nml-nmg-flat-caps.zip',
      injectUFGLib: true,
      withNML: true,
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
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'native ufg ios nml',
      },
    })
    await eyes.check({
      settings: {
        waitBeforeCapture: 1500,
        renderers: [{iosDeviceInfo: {deviceName: 'iPhone 12', version: 'latest-1'}}],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
