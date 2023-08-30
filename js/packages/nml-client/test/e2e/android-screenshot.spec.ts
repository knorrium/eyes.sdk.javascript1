import {makeNMLClient} from '../../src/client'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

async function extractBrokerUrl(driver: spec.Driver): Promise<string> {
  const element = await driver.findElement('accessibility id', 'Applitools_View')
  const payload = await driver.getElementText(element['element-6066-11e4-a52e-4f735466cecf'])
  const result = JSON.parse(payload)
  return result.nextPath
}

describe('android screenshot', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  const renderEnvironmentsUrl = 'https://applitoolsnmlresources.z19.web.core.windows.net/devices-list.json'

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
    const {takeScreenshots} = makeNMLClient({settings: {brokerUrl, renderEnvironmentsUrl}})
    const screenshots = await takeScreenshots({settings: {renderers: [{environment: {}}], fully: true}})

    assert.strictEqual(screenshots.length, 1)
    assert.strictEqual(typeof screenshots[0].image, 'string')
  })
})
