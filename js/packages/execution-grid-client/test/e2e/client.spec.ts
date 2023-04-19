import type {ECClient} from '../../src/types'
import {Builder, type WebDriver} from 'selenium-webdriver'
import {getTestInfo} from '@applitools/test-utils'
import {makeECClient} from '../../src/client'
import assert from 'assert'

describe('client', () => {
  let client: ECClient, driver: WebDriver

  afterEach(async () => {
    await driver.quit()
    await client.close()
  })

  it('works', async () => {
    client = await makeECClient()
    driver = await new Builder().forBrowser('chrome').usingServer(client.url).build()

    await driver.get('https://demo.applitools.com')
    const title = await driver.executeScript('return document.title')

    assert.strictEqual(title, 'ACME demo app')
  })

  it('works with self healing', async () => {
    client = await makeECClient()

    driver = new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:useSelfHealing': true})
      .usingServer(client.url)
      .build()

    await driver.get('https://demo.applitools.com')
    await driver.findElement({css: '#log-in'})
    await driver.executeScript("document.querySelector('#log-in').id = 'log-inn'")
    await driver.findElement({css: '#log-in'})

    const result: any[] = await driver.executeScript('applitools:metadata')
    assert.deepStrictEqual(result.length, 1)
    assert.ok(result[0].successfulSelector)
    assert.deepStrictEqual(result[0].originalSelector, {using: 'css selector', value: '#log-in'})
    const noResult: any[] = await driver.executeScript('applitools:metadata')
    assert.deepStrictEqual(noResult, [])
  })

  it('works with functional tests', async () => {
    client = await makeECClient()

    driver = await new Builder().withCapabilities({browserName: 'chrome'}).usingServer(client.url).build()

    await driver.executeScript('applitools:startTest', {testName: 'EC functional test'})
    await driver.get('https://applitools.com')
    await driver.executeScript('applitools:endTest', {status: 'Failed'})
    const [result] = await driver.executeScript<any[]>('applitools:getResults')
    const info = await getTestInfo(result)
    assert.strictEqual(info.scenarioName, 'EC functional test')
    assert.strictEqual(info.appName, 'default')
    assert.strictEqual(info.startInfo.nonVisual, true)
    assert.deepStrictEqual(info.startInfo.properties, [{name: 'Execution Cloud', value: 'Yes'}])
    // assert.strictEqual(info.status, 'Failed') bug on backend
  })
})
