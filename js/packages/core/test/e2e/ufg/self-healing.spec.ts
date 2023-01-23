import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'
import {getTestInfo} from '@applitools/test-utils'
import {makeEGClient} from '@applitools/execution-grid-client'

async function triggerSelfHealing(driver) {
  await driver.get('https://demo.applitools.com')
  await driver.findElement({css: '#log-in'})
  await driver.executeScript("document.querySelector('#log-in').id = 'log-inn'")
  await driver.findElement({css: '#log-in'})
}

describe('self-healing ufg', () => {
  let driver, destroyDriver, proxy, core
  const serverUrl = 'https://eyesapi.applitools.com'

  before(async () => {
    proxy = await makeEGClient({
      settings: {
        capabilities: {eyesServerUrl: serverUrl, useSelfHealing: true},
      },
    })
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome', url: proxy.url})
    core = makeCore({spec, concurrency: 10})
  })

  after(async () => {
    await destroyDriver?.()
    await proxy.close()
  })

  it('sends report on close', async () => {
    await triggerSelfHealing(driver)
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl,
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core e2e',
        testName: 'ufg - self-healing',
        environment: {viewportSize: {width: 700, height: 460}},
      },
    })

    await eyes.check({})

    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#log-in')
      assert.deepStrictEqual(result.new.value, '//*[@href="/app.html" ]')
      assert(Date.parse(result.timeStamp))
    })
  })

  it('sends report on abort', async () => {
    await triggerSelfHealing(driver)

    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl,
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core e2e',
        testName: 'ufg - self-healing',
        environment: {viewportSize: {width: 700, height: 460}},
      },
    })
    await eyes.check({})

    const [result] = await eyes.abort()
    const testInfo = await getTestInfo(result)
    testInfo.selfHealingInfo.operations.forEach((result: any) => {
      assert.deepStrictEqual(result.old.value, '#log-in')
      // assert.deepStrictEqual(result.new.value, '//*[@href="/app.html" ]')
      assert(Date.parse(result.timeStamp))
    })
  })
})
