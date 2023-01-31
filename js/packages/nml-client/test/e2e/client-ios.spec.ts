import {takeSnapshots} from '../../src/client'
import {makeProxyServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'

async function extractBrokerUrl(driver: any): Promise<string> {
  const element = await driver.findElement({xpath: '//XCUIElementTypeOther[@name="Applitools_View"]'})
  const result = JSON.parse(await element.getText())
  return result.nextPath
}

describe('client ios', () => {
  const env = {
    device: 'iPhone 13',
    app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp-instrumented-nml-nmg-flat-caps.zip',
    injectUFGLib: true,
    withNML: true,
  }
  describe('takeSnapshots', () => {
    it('works', async () => {
      const [driver, destroyDriver] = await spec.build(env)
      try {
        const brokerUrl = await extractBrokerUrl(driver)
        const snapshots = await takeSnapshots({
          url: brokerUrl,
          settings: {renderers: [{iosDeviceInfo: {deviceName: 'iPhone 12'}}]},
        })
        assert.strictEqual(snapshots.length, 1)
        assert.strictEqual(snapshots[0].platformName, 'ios')
        assert.strictEqual(snapshots[0].vhsHash.hashFormat, 'sha256')
        assert.strictEqual(snapshots[0].vhsHash.contentType, 'x-applitools-vhs/ios')
      } finally {
        await destroyDriver()
      }
    })

    it('works with a proxy server', async () => {
      let proxyServer
      const [driver, destroyDriver] = await spec.build(env)
      try {
        proxyServer = await makeProxyServer()
        const brokerUrl = await extractBrokerUrl(driver)
        const snapshots = await takeSnapshots({
          url: brokerUrl,
          settings: {
            renderers: [{iosDeviceInfo: {deviceName: 'iPhone 12'}}],
            proxy: {url: `http://localhost:${proxyServer.port}`},
          },
        })
        assert.strictEqual(snapshots.length, 1)
        assert.strictEqual(snapshots[0].platformName, 'ios')
        assert.strictEqual(snapshots[0].vhsHash.hashFormat, 'sha256')
        assert.strictEqual(snapshots[0].vhsHash.contentType, 'x-applitools-vhs/ios')
      } finally {
        await destroyDriver?.()
        await proxyServer?.close()
      }
    })
  })
})
