import {makeCore, type Core, type ECClient} from '../../src/index'
import {getTestInfo} from '@applitools/test-utils'
import {type SpecType} from '@applitools/driver'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

async function triggerSelfHealing(driver: spec.Driver) {
  await driver.url(`https://demo.applitools.com?${Math.random()}`)
  await driver.$('#log-in')
  await driver.execute("document.querySelector('#log-in').id = 'log-inn'")
  await driver.$('#log-in')
}

describe('self-healing', () => {
  let driver: spec.Driver,
    destroyDriver: () => Promise<void>,
    client: ECClient,
    core: Core<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>, 'classic' | 'ufg'>
  const serverUrl = 'https://eyesapi.applitools.com'

  before(async () => {
    core = makeCore({spec, concurrency: 10})
    client = await core.getECClient({
      settings: {options: {eyesServerUrl: serverUrl, useSelfHealing: true}},
    })
    ;[driver, destroyDriver] = await spec.build({
      browser: 'chrome',
      headless: false,
      url: client.url,
    })
  })

  after(async () => {
    await destroyDriver?.()
    await client.close()
  })

  it('sends report on close - ufg', async () => {
    await triggerSelfHealing(driver)
    const eyes = await core.openEyes({
      type: 'ufg',
      target: driver,
      settings: {appName: 'core e2e', testName: 'ufg - self-healing'},
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
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
    await eyes.check()
    await eyes.abort()
    const [result] = await eyes.getResults()
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
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
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
    await eyes.check()
    await eyes.abort()
    const [result] = await eyes.getResults()
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#log-in')
      assert(Date.parse(result.timeStamp))
    })
  })
})
