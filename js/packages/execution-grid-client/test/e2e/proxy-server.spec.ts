import assert from 'assert'
import {Builder} from 'selenium-webdriver'
import {makeServer} from '../../src'
import {spawn} from 'child_process'
import {Command} from 'selenium-webdriver/lib/command'
import * as utils from '@applitools/utils'

async function createTunnel() {
  process.env.APPLITOOLS_EG_TUNNEL_PORT = '12345'
  const tunnel = spawn('node', ['./node_modules/@applitools/eg-tunnel/scripts/run-eg-tunnel.js'], {
    detached: true,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  await new Promise(res => setTimeout(res, 500)) // wait for tunnel to be ready
  tunnel.unref()
  return tunnel
}

describe('proxy-server', () => {
  const eyesServerUrl = 'https://eyesapi.applitools.com'
  let proxy: any

  afterEach(async () => {
    await proxy.server.close()
  })

  it('works with real server', async () => {
    proxy = await makeServer({
      eyesServerUrl,
    })
    const driver = await new Builder().forBrowser('chrome').usingServer(proxy.url).build()

    await driver.get('https://demo.applitools.com')
    const title = await driver.executeScript('return document.title')

    await driver.quit()

    assert.strictEqual(title, 'ACME demo app')
  })

  it('works with real server and tunnel', async () => {
    const tunnel = await createTunnel()
    try {
      proxy = await makeServer({
        egTunnelUrl: 'http://localhost:12345',
        eyesServerUrl,
      })
      const driver = await new Builder()
        .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
        .usingServer(proxy.url)
        .build()

      await driver.get('https://applitools.com')

      await driver.quit()
    } finally {
      tunnel.kill()
    }
  })

  it('works with self healing', async () => {
    let driver: any
    try {
      proxy = await makeServer({
        eyesServerUrl,
        useSelfHealing: true,
      })
      const builder = new Builder().
        withCapabilities({browserName: 'chrome', 'applitools:useSelfHealing': true}).
        usingServer(proxy.url)

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
      assert.ok(utils.types.isNotDefined(noResult))
    } finally {
      await driver.quit()
    }
  })
})
