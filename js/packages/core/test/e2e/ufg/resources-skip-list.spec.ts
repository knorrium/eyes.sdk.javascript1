import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import {adjustUrlToDocker} from '../../utils/adjust-url-to-docker'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('resources skip list', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  let server: any

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    server = await makeTestServer({port: 5558, middlewares: ['ephemeral']})
  })

  after(async () => {
    await server?.close()
    await destroyDriver?.()
  })

  it('skips already fetched resources', async () => {
    const pageUrl = adjustUrlToDocker('http://localhost:5558/skip-list/skip-list.html')
    await driver.url(pageUrl)
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'dom snapshot skip list',
        environment: {
          viewportSize: {width: 800, height: 600},
        },
      },
    })
    await eyes.check({settings: {fully: true}})
    await driver.url(pageUrl)
    await eyes.check({settings: {fully: true}})
    const [result] = await eyes.close({settings: {updateBaselineIfNew: false}})
    assert.strictEqual(result.status, 'Passed')
  })
})
