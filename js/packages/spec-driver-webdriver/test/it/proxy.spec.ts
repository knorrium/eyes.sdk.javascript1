import assert from 'assert'
import {makeTestServer, makeProxyServer, generateCertificate, restrictNetwork} from '@applitools/test-server'
import * as spec from '../../src/spec-driver'
import * as utils from '@applitools/utils'

describe('proxy', () => {
  let driver: spec.Driver, destroyDriver: () => void
  let proxyServer: any, webdriverServer: any, restoreNetwork: () => void, pageUrl: string

  before(async () => {
    const authority = await generateCertificate({days: 1})
    webdriverServer = await makeTestServer({...authority, middlewares: ['webdriver']})
    proxyServer = await makeProxyServer()
    ;[driver, destroyDriver] = await spec.build({
      url: `https://localhost:${webdriverServer.port}`,
      capabilities: {browserName: 'test'},
    })
    pageUrl = 'https://applitools.github.io/demo/TestPages/FramesTestPage/'
    await driver.navigateTo(pageUrl)
    restoreNetwork = restrictNetwork(options => {
      if (
        utils.types.has(options, 'port') &&
        options.port === webdriverServer.port &&
        (!options.host || options.host === 'localhost') &&
        (options as any).headers?.['x-proxy-agent'] !== 'TestProxy'
      ) {
        return false
      }
      return true
    })
  })

  after(async () => {
    await restoreNetwork?.()
    await destroyDriver?.()
    await proxyServer?.close()
    await webdriverServer?.close()
  })

  it('with proxy', async () => {
    const proxifiedDriver = await spec.toDriver({
      sessionId: driver.sessionId,
      serverUrl: `https://localhost:${webdriverServer.port}`,
      proxy: {url: `http://localhost:${proxyServer.port}`},
      capabilities: driver.capabilities,
    })
    assert.strictEqual(await proxifiedDriver.getUrl(), pageUrl)
  })
})
