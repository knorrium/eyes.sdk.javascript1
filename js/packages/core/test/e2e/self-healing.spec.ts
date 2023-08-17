import {makeCore, type Core, type ECClient} from '../../src/index'
import {getTestInfo} from '@applitools/test-utils'
import {type SpecType} from '@applitools/driver'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

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
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/SelfHealingPage/')
    // NOTE: This selector doesn't exist on the page
    await driver.findElement('css selector', '#heal-me')

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
      assert.deepStrictEqual(result.old.value, '#heal-me')
      assert(Date.parse(result.timeStamp))
    })
  })

  it('sends report on abort - ufg', async () => {
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/SelfHealingPage/')
    // NOTE: This selector doesn't exist on the page
    await driver.findElement('css selector', '#heal-me')

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
      assert.deepStrictEqual(result.old.value, '#heal-me')
      assert(Date.parse(result.timeStamp))
    })
  })

  it('sends report on close - classic', async () => {
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/SelfHealingPage/')
    // NOTE: This selector doesn't exist on the page
    await driver.findElement('css selector', '#heal-me')

    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'classic - self-healing'},
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#heal-me')
      assert(Date.parse(result.timeStamp))
    })
  })

  it('sends report on abort - classic', async () => {
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/SelfHealingPage/')
    // NOTE: This selector doesn't exist on the page
    await driver.findElement('css selector', '#heal-me')

    const eyes = await core.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'classic - self-healing'},
    })
    await eyes.check()
    await eyes.abort()
    const [result] = await eyes.getResults()
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#heal-me')
      assert(Date.parse(result.timeStamp))
    })
  })
})
