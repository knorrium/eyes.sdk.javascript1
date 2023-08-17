import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('nml - android (@sauce)', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      //url: 'http://0.0.0.0:4723/wd/hub',
      device: 'Pixel 4 XL',
      app: 'https://applitools.jfrog.io/artifactory/Examples/simpleapp-appAndroidX-debug.apk.zip',
      capabilities: {
        'appium:appPackage': 'com.applitools.simpleapp',
        'appium:appActivity': 'com.applitools.simpleapp.MainActivity',
        'appium:newCommandTimeout': 300,
        'appium:idleTimeout': 300,
      },
      injectUFGLib: true,
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
        testName: 'native ufg android nml',
      },
    })
    await eyes.check({
      settings: {
        waitBeforeCapture: 1500,
        renderers: [{androidDeviceInfo: {deviceName: 'Pixel 5', version: 'latest'}}],
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
