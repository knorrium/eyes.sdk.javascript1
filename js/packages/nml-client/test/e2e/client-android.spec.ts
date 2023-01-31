import {takeSnapshots} from '../../src/client'
import {makeProxyServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'

async function extractBrokerUrl(driver: any): Promise<string> {
  const element = await driver.findElement({
    xpath: '//android.widget.TextView[@content-desc="Applitools_View"]',
  })
  const payload = await element.getText()
  const result = JSON.parse(payload)
  return result.nextPath
}

describe('client android', () => {
  const env = {
    //url: 'http://0.0.0.0:4723/wd/hub',
    device: 'Pixel 4 XL',
    app: 'https://applitools.jfrog.io/artifactory/Examples/simpleapp-appAndroidX-debug.apk.zip',
    capabilities: {
      'appium:appPackage': 'com.applitools.simpleapp',
      'appium:appActivity': 'com.applitools.simpleapp.MainActivity',
      'appium:newCommandTimeout': 300,
      'appium:idleTimeout': 300,
    },
    injectUFGLib: true,
  }
  describe('takeSnapshots', () => {
    it('works', async () => {
      const [driver, destroyDriver] = await spec.build(env)
      try {
        const brokerUrl = await extractBrokerUrl(driver)
        const snapshots = await takeSnapshots({
          url: brokerUrl,
          settings: {renderers: [{androidDeviceInfo: {deviceName: 'Pixel 3'}}]},
        })
        assert.strictEqual(snapshots.length, 1)
        assert.strictEqual(snapshots[0].platformName, 'android')
        assert.strictEqual(snapshots[0].vhsHash.hashFormat, 'sha256')
        assert.strictEqual(snapshots[0].vhsHash.contentType, 'x-applitools-vhs/android')
      } finally {
        await destroyDriver()
      }
    })

    it('works with a proxy server', async () => {
      const proxyServer = await makeProxyServer()
      process.env.HTTP_PROXY = `http://localhost:${proxyServer.port}`
      const [driver, destroyDriver] = await spec.build(env)
      try {
        const brokerUrl = await extractBrokerUrl(driver)
        const snapshots = await takeSnapshots({
          url: brokerUrl,
          settings: {
            renderers: [{androidDeviceInfo: {deviceName: 'Pixel 3'}}],
            proxy: {url: process.env.HTTP_PROXY},
          },
        })
        assert.strictEqual(snapshots.length, 1)
        assert.strictEqual(snapshots[0].platformName, 'android')
        assert.strictEqual(snapshots[0].vhsHash.hashFormat, 'sha256')
        assert.strictEqual(snapshots[0].vhsHash.contentType, 'x-applitools-vhs/android')
      } finally {
        process.env.HTTP_PROXY = undefined
        await destroyDriver?.()
        await proxyServer?.close()
      }
    })
  })
})
