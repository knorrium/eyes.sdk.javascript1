import {makeNMLClient} from '../../src/client'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

async function extractBrokerUrl(driver: spec.Driver): Promise<string> {
  const element = await driver.$('accessibility id:Applitools_View')
  const payload = await element.getText()
  const result = JSON.parse(payload)
  return result.nextPath
}

describe('android screenshot', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({
      //url: 'http://0.0.0.0:4723/wd/hub',
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

  afterEach(async () => {
    await destroyDriver?.()
  })

  it('works', async () => {
    const brokerUrl = await extractBrokerUrl(driver)
    const {takeScreenshot} = makeNMLClient({config: {brokerUrl}})
    const screenshot = await takeScreenshot({settings: {fully: true}})
    assert.strictEqual(typeof screenshot.image, 'string')
  })
})
