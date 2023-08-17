import {makeCore, type Core, type ECClient} from '../../src/index'
import {type SpecType} from '@applitools/driver'
import {getTestInfo} from '@applitools/test-utils'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('ecSessionId', () => {
  let driver: spec.Driver,
    destroyDriver: () => Promise<void>,
    client: ECClient,
    core: Core<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>, 'classic' | 'ufg'>

  before(async () => {
    core = makeCore({spec})
    client = await core.getECClient({
      settings: {options: {useSelfHealing: true}},
    })
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome', headless: false, url: client.url})
  })

  after(async () => {
    await destroyDriver?.()
    await client?.close()
  })

  it('sends ecSessionId in classic', async () => {
    const eyes = await core.openEyes({
      type: 'classic',
      target: driver,
      settings: {appName: 'core e2e', testName: 'classic - ecSessionId'},
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    const {sessionId} = await spec.getDriverInfo(driver)
    const info = await getTestInfo(result)
    assert.deepStrictEqual(info.egSessionId, sessionId)
  })

  it('sends ecSessionId in ufg', async () => {
    const eyes = await core.openEyes({
      type: 'ufg',
      target: driver,
      settings: {appName: 'core e2e', testName: 'ufg - ecSessionId'},
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    const {sessionId} = await spec.getDriverInfo(driver)
    const info = await getTestInfo(result)
    assert.deepStrictEqual(info.egSessionId, sessionId)
  })
})
