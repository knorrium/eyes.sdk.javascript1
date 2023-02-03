import type {AndroidSnapshot} from '../../src/types'
import {takeSnapshots} from '../../src/client'
import {makeProxyServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

async function extractBrokerUrl(driver: spec.Driver): Promise<string> {
  const element = await driver.$('accessibility id:Applitools_View')
  const payload = await element.getText()
  const result = JSON.parse(payload)
  return result.nextPath
}

describe('android snapshot', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  let proxyServer: any

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({
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
    })
    proxyServer = await makeProxyServer()
  })

  afterEach(async () => {
    await destroyDriver?.()
    await proxyServer?.close()
  })

  it('works', async () => {
    const brokerUrl = await extractBrokerUrl(driver)
    const snapshots = await takeSnapshots<AndroidSnapshot>({
      url: brokerUrl,
      settings: {renderers: [{androidDeviceInfo: {deviceName: 'Pixel 3'}}]},
    })
    assert.strictEqual(snapshots.length, 1)
    assert.strictEqual(snapshots[0].platformName, 'android')
    assert.strictEqual(snapshots[0].vhsHash.hashFormat, 'sha256')
    assert.strictEqual(snapshots[0].vhsHash.contentType, 'x-applitools-vhs/android')
  })

  it('works with a proxy server', async () => {
    const brokerUrl = await extractBrokerUrl(driver)
    const snapshots = await takeSnapshots<AndroidSnapshot>({
      url: brokerUrl,
      settings: {
        renderers: [{androidDeviceInfo: {deviceName: 'Pixel 3'}}],
        proxy: {url: `http://localhost:${proxyServer.port}`},
      },
    })
    assert.strictEqual(snapshots.length, 1)
    assert.strictEqual(snapshots[0].platformName, 'android')
    assert.strictEqual(snapshots[0].vhsHash.hashFormat, 'sha256')
    assert.strictEqual(snapshots[0].vhsHash.contentType, 'x-applitools-vhs/android')
  })
})
