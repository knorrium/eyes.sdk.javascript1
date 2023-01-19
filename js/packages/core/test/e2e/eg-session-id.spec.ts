import {makeCore} from '../../src/index'
import * as spec from '@applitools/spec-driver-selenium'
import assert from 'assert'
import {getTestInfo} from '@applitools/test-utils'

describe('egSessionId', () => {
  let core
  const serverUrl = 'https://eyesapi.applitools.com'

  before(async () => {
    core = makeCore<spec.Driver, spec.Driver, spec.Element, spec.Selector>({spec})
  })

  it('does not send egSessionId by default', async () => {
    const [driver, destroyDriver] = await spec.build({browser: 'chrome'})
    try {
      const eyes = await core.openEyes({
        target: driver,
        settings: {
          serverUrl,
          apiKey: process.env.APPLITOOLS_API_KEY,
          appName: 'core e2e',
          testName: 'classic - egSessionId',
          environment: {viewportSize: {width: 700, height: 460}},
        },
      })
      await eyes.check({})

      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
      const testInfo = await getTestInfo(result)
      assert.deepStrictEqual(testInfo.egSessionId, undefined)
    } finally {
      await destroyDriver()
    }
  })

  it('sends egSessionId when eg-client is used', async () => {
    const proxy = await core.makeEGClient({
      settings: {
        capabilities: {
          eyesServerUrl: serverUrl,
          useSelfHealing: true,
        },
      },
    })

    const [driver, destroyDriver] = await spec.build({browser: 'chrome', url: proxy.url})
    try {
      const eyes = await core.openEyes({
        target: driver,
        settings: {
          serverUrl,
          apiKey: process.env.APPLITOOLS_API_KEY,
          appName: 'core e2e',
          testName: 'classic - egSessionId',
          environment: {viewportSize: {width: 700, height: 460}},
        },
      })
      await eyes.check({})

      const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
      const testInfo = await getTestInfo(result)
      const {sessionId} = await spec.getDriverInfo(driver)
      assert.deepStrictEqual(testInfo.egSessionId, sessionId)
    } finally {
      await destroyDriver?.()
      await proxy.close()
    }
  })
})
