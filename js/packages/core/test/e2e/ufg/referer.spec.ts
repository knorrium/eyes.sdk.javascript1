import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import {adjustUrlToDocker} from '../../utils/adjust-url-to-docker'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('referer', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  let server: any, serverCors: any, pageUrl: string

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    server = await makeTestServer({port: 5555})
    pageUrl = adjustUrlToDocker('http://localhost:5555/referer/cors.html')
    serverCors = await makeTestServer({
      port: 5556,
      middlewares: ['cors'],
      allowCors: false,
      allowedUrls: [pageUrl],
    })
  })

  after(async () => {
    await server?.close()
    await serverCors?.close()
    await destroyDriver?.()
  })

  it('sends referer header when fetching resources', async () => {
    await driver.url(pageUrl)
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'referer',
        environment: {
          viewportSize: {width: 800, height: 600},
        },
      },
    })
    await eyes.check({settings: {disableBrowserFetching: true}})
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
