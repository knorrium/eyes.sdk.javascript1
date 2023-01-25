import {makeCore} from '../../src/core'
import {getTestInfo} from '@applitools/test-utils'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'

async function triggerSelfHealing(driver) {
  await driver.get('https://demo.applitools.com')
  await driver.findElement({css: '#log-in'})
  await driver.executeScript("document.querySelector('#log-in').id = 'log-inn'")
  await driver.findElement({css: '#log-in'})
}

describe('self-healing', () => {
  let driver, destroyDriver, proxy, core
  const serverUrl = 'https://eyesapi.applitools.com'

  before(async () => {
    core = makeCore({spec, concurrency: 10})
    proxy = await core.makeECClient({
      settings: {capabilities: {eyesServerUrl: serverUrl, useSelfHealing: true}},
    })
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome', url: proxy.url})
  })

  after(async () => {
    await destroyDriver?.()
    await proxy.close()
  })

  it('sends report on close - ufg', async () => {
    await triggerSelfHealing(driver)
    const eyes = await core.openEyes({
      type: 'ufg',
      target: driver,
      settings: {appName: 'core e2e', testName: 'ufg - self-healing'},
    })

    await eyes.check({})

    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#log-in')
      assert(Date.parse(result.timeStamp))
    })
  })

  it('sends report on abort - ufg', async () => {
    await triggerSelfHealing(driver)
    const eyes = await core.openEyes({
      type: 'ufg',
      target: driver,
      settings: {appName: 'core e2e', testName: 'ufg - self-healing'},
    })
    await eyes.check({})

    const [result] = await eyes.abort()
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#log-in')
      assert(Date.parse(result.timeStamp))
    })
  })

  it('sends report on close - classic', async () => {
    await triggerSelfHealing(driver)
    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'classic - self-healing'},
    })
    await eyes.check({})

    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#log-in')
      assert(Date.parse(result.timeStamp))
    })
  })

  it('sends report on abort - classic', async () => {
    await triggerSelfHealing(driver)
    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'classic - self-healing'},
    })
    await eyes.check({})

    const [result] = await eyes.abort()
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#log-in')
      assert(Date.parse(result.timeStamp))
    })
  })
})
