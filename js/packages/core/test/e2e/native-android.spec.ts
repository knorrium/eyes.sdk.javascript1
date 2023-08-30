import {makeCore} from '../../src/index'
import * as spec from '@applitools/spec-driver-webdriver'

describe('native android (@sauce)', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      device: 'Pixel 4 XL',
      app: 'https://applitools.jfrog.io/artifactory/Examples/simpleapp_13_06_2023.apk',
      capabilities: {
        'appium:appPackage': 'com.applitools.simpleapp',
        'appium:appActivity': 'com.applitools.simpleapp.SDKBrokerTester',
        'appium:optionalIntentArguments': `--es APPLITOOLS '{"APPLITOOLS_API_KEY": "${process.env.APPLITOOLS_API_KEY}"}'`,
        'appium:newCommandTimeout': 300,
        'appium:idleTimeout': 300,
      },
    })
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('works in applitools-lib mode', async () => {
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      type: 'classic',
      target: driver,
      settings: {appName: 'core app', testName: 'native classic android nml'},
    })
    await eyes.check({settings: {screenshotMode: 'applitools-lib'}})
    await eyes.close({settings: {updateBaselineIfNew: false}})
    await eyes.getResults({settings: {throwErr: true}})
  })
})
