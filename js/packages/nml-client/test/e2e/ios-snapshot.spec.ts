import type {IOSSnapshot} from '../../src/types'
import {makeNMLClient} from '../../src/client'
import {makeProxyServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

async function extractBrokerUrl(driver: spec.Driver): Promise<string> {
  const element = await driver.$('accessibility id:Applitools_View')
  const payload = await element.getText()
  const result = JSON.parse(payload)
  return result.nextPath
}

describe('ios snapshot', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  let proxyServer: any

  beforeEach(async () => {
    ;[driver, destroyDriver] = await spec.build({
      //url: 'http://0.0.0.0:4723/wd/hub',
      device: 'iPhone 13',
      app: 'https://applitools.jfrog.io/artifactory/Examples/IOSTestApp-instrumented-nml-nmg-flat-caps.zip',
      injectUFGLib: true,
      withNML: true,
    })
    proxyServer = await makeProxyServer()
  })

  afterEach(async () => {
    await destroyDriver?.()
    await proxyServer?.close()
  })

  it('works', async () => {
    const brokerUrl = await extractBrokerUrl(driver)
    const {takeSnapshots} = makeNMLClient({config: {brokerUrl}})
    const snapshots = await takeSnapshots<IOSSnapshot>({
      settings: {renderers: [{iosDeviceInfo: {deviceName: 'iPhone 12'}}]},
    })
    assert.strictEqual(snapshots.length, 1)
    assert.strictEqual(snapshots[0].platformName, 'ios')
    assert.strictEqual(snapshots[0].vhsHash.hashFormat, 'sha256')
    assert.strictEqual(snapshots[0].vhsHash.contentType, 'x-applitools-vhs/ios')
  })

  it('works with a proxy server', async () => {
    const brokerUrl = await extractBrokerUrl(driver)
    const {takeSnapshots} = makeNMLClient({config: {brokerUrl, proxy: {url: `http://localhost:${proxyServer.port}`}}})
    const snapshots = await takeSnapshots({
      settings: {
        renderers: [{iosDeviceInfo: {deviceName: 'iPhone 12'}}],
      },
    })
    assert.strictEqual(snapshots.length, 1)
    assert.strictEqual(snapshots[0].platformName, 'ios')
    assert.strictEqual(snapshots[0].vhsHash.hashFormat, 'sha256')
    assert.strictEqual(snapshots[0].vhsHash.contentType, 'x-applitools-vhs/ios')
  })
})
