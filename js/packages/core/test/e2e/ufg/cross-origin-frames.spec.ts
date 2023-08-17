import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import {adjustUrlToDocker} from '../../utils/adjust-url-to-docker'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('cross origin frames', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>
  let server: any, serverCors: any

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    serverCors = await makeTestServer({allowCors: false})
    server = await makeTestServer({
      middlewares: ['handlebars'],
      hbData: {
        src: adjustUrlToDocker(`http://localhost:${serverCors.port}/cors-frames/frame.html`),
      },
    })
  })

  after(async () => {
    await destroyDriver?.()
    await server?.close()
    await serverCors?.close()
  })

  it('should take screenshot with cross origin frame', async () => {
    await driver.navigateTo(adjustUrlToDocker(`http://localhost:${server.port}/cors-frames/cors.hbs`))
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core app',
        testName: 'cross origin frames',
        environment: {
          viewportSize: {width: 1200, height: 800},
        },
      },
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
