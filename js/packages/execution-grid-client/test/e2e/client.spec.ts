import type {EGClient} from '../../src/types'
import {Builder} from 'selenium-webdriver'
import {Command} from 'selenium-webdriver/lib/command'
import {makeTestServer} from '@applitools/test-server'
import {makeEGClient} from '../../src/client'
import assert from 'assert'

describe('proxy-server', () => {
  let client: EGClient

  afterEach(async () => {
    await client.close()
  })

  it('works with real server', async () => {
    client = await makeEGClient()
    const driver = await new Builder().forBrowser('chrome').usingServer(client.url).build()

    await driver.get('https://demo.applitools.com')
    const title = await driver.executeScript('return document.title')

    await driver.quit()

    assert.strictEqual(title, 'ACME demo app')
  })

  it('works with self healing', async () => {
    let driver: any
    try {
      client = await makeEGClient()

      const builder = new Builder()
        .withCapabilities({browserName: 'chrome', 'applitools:useSelfHealing': true})
        .usingServer(client.url)

      driver = await builder.build()
      await driver.get('https://demo.applitools.com')
      await driver.findElement({css: '#log-in'})
      await driver.executeScript("document.querySelector('#log-in').id = 'log-inn'")
      await driver.findElement({css: '#log-in'})

      driver.getExecutor().defineCommand('getSessionMetadata', 'GET', '/session/:sessionId/applitools/metadata')
      const result = await driver.execute(new Command('getSessionMetadata'))
      assert.deepStrictEqual(result.length, 1)
      assert.ok(result[0].successfulSelector)
      assert.deepStrictEqual(result[0].originalSelector, {using: 'css selector', value: '#log-in'})
      const noResult = await driver.execute(new Command('getSessionMetadata'))
      assert.strictEqual(noResult, null)
    } finally {
      await driver.quit()
    }
  })

  describe('with tunnel', () => {
    let server: any, url: string

    before(async () => {
      server = await makeTestServer()
      url = `http://localhost:${server.port}/page/index.html`
    })

    after(async () => {
      await server.close()
    })

    it('works with real server and tunnels', async () => {
      client = await makeEGClient()
      const driver = await new Builder()
        .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
        .usingServer(client.url)
        .build()

      await driver.get(url)
      const title = await driver.executeScript('return document.title')

      await driver.quit()

      assert.strictEqual(title, 'My local page')
    })

    // TODO: add assertion for expected error
    it.skip('fails gracefully when tunnel closes during test run', async () => {
      client = await makeEGClient()
      let driver = await new Builder()
        .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
        .usingServer(client.url)
        .build()
      await driver.get('https://applitools.com')
      await driver.quit()
      driver = await new Builder()
        .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
        .usingServer(client.url)
        .build()
      await driver.get('https://applitools.com')
      await driver.quit()
    })
  })
})
