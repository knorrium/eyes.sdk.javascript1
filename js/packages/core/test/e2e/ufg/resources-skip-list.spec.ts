import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import {adjustUrlToDocker} from '../../utils/adjust-url-to-docker'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('resources skip list', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  let server: any

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    server = await makeTestServer({middlewares: ['ephemeral']})
  })

  after(async () => {
    await server?.close()
    await destroyDriver?.()
  })

  it('skips already fetched resources', async () => {
    const pageUrl = adjustUrlToDocker(`http://localhost:${server.port}/skip-list/skip-list.html`)
    await driver.navigateTo(pageUrl)
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'dom snapshot skip list',
        environment: {
          viewportSize: {width: 800, height: 600},
        },
      },
    })
    await eyes.check({settings: {stepIndex: 0, fully: true}})
    await driver.navigateTo(pageUrl)
    await eyes.check({settings: {stepIndex: 1, fully: true}})
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
