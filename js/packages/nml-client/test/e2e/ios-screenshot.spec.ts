import {makeNMLClient} from '../../src/client'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

async function extractBrokerUrl(driver: spec.Driver): Promise<string> {
  const element = await driver.$('accessibility id:Applitools_View')
  const payload = await element.getText()
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
      injectUFGLib: true,
      withNML: true,
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
