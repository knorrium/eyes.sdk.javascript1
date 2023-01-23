import {makeCore} from '../../src/index'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'
import {getTestInfo} from '@applitools/test-utils'

describe('egSessionId', () => {
  let core, client, driver, destroyDriver
  const serverUrl = 'https://eyesapi.applitools.com'

  before(async () => {
    core = makeCore<spec.Driver, spec.Driver, spec.Element, spec.Selector>({spec})
    client = await core.makeEGClient({
      settings: {
        capabilities: {
          eyesServerUrl: serverUrl,
          useSelfHealing: true,
        },
      },
    })
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome', url: client.url})
  })

  after(async () => {
    await destroyDriver?.()
    await client?.close()
  })

  it('sends egSessionId in classic', async () => {
    const eyes = await core.openEyes({
      type: 'classic',
      target: driver,
      settings: {
        serverUrl,
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core e2e',
        testName: 'classic - egSessionId',
        environment: {viewportSize: {width: 700, height: 460}},
      },
    })
    await eyes.check()
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    const {sessionId} = await spec.getDriverInfo(driver)
    const info = await getTestInfo(result)
    assert.deepStrictEqual(info.egSessionId, sessionId)
  })

  it('sends egSessionId in ufg', async () => {
    const eyes = await core.openEyes({
      type: 'ufg',
      target: driver,
      settings: {
        serverUrl,
        apiKey: process.env.APPLITOOLS_API_KEY,
        appName: 'core e2e',
        testName: 'classic - egSessionId',
        environment: {viewportSize: {width: 700, height: 460}},
      },
    })
    await eyes.check()
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    const {sessionId} = await spec.getDriverInfo(driver)
    const info = await getTestInfo(result)
    assert.deepStrictEqual(info.egSessionId, sessionId)
  })
})
