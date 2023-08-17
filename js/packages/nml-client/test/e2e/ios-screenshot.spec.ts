import {makeNMLClient} from '../../src/client'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

async function extractBrokerUrl(driver: spec.Driver): Promise<string> {
  const element = await driver.findElement('accessibility id', 'Applitools_View')
  const payload = await driver.getElementText(element['element-6066-11e4-a52e-4f735466cecf'])
  const result = JSON.parse(payload)
  return result.nextPath
}

describe('ios screenshot', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({
      //url: 'http://0.0.0.0:4723/wd/hub',
      device: 'iPhone 13',
      app: 'https://applitools.jfrog.io/artifactory/ufg-mobile/UFGTestApp.app.zip',
      capabilities: {
        'appium:processArguments': {args: [], env: {APPLITOOLS_API_KEY: process.env.APPLITOOLS_API_KEY}},
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
