import {makeCore} from '../../src/index'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'
import {getTestInfo} from '@applitools/test-utils'

describe('ecSessionId', () => {
  let core, client, driver, destroyDriver
  const serverUrl = 'https://eyesapi.applitools.com'

  before(async () => {
    core = makeCore<spec.Driver, spec.Driver, spec.Element, spec.Selector>({spec})
    client = await core.makeECClient({
      settings: {capabilities: {eyesServerUrl: serverUrl, useSelfHealing: true}},
    })
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome', url: client.url})
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
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
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
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    const {sessionId} = await spec.getDriverInfo(driver)
    const info = await getTestInfo(result)
    assert.deepStrictEqual(info.egSessionId, sessionId)
  })
})
