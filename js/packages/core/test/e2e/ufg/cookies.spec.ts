import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import {adjustUrlToDocker} from '../../utils/adjust-url-to-docker'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('cookies', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  let server: any

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    server = await makeTestServer({
      middlewares: ['cookies', 'handlebars'],
      hbData: {
        imageSrc: `./images/cookies.jpeg?checkCookie[name]=token&checkCookie[value]=12345`,
      },
    })
  })

  after(async () => {
    await server?.close()
    await destroyDriver?.()
  })

  it('uses cookies when fetching resources', async () => {
    const pageUrl = adjustUrlToDocker(
      `http://localhost:${server.port}/cookies/index.hbs?writeCookie[name]=token&writeCookie[value]=12345&writeCookie[options][path]=/cookies/images`,
    )
    await driver.url(pageUrl)
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'cookies',
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
