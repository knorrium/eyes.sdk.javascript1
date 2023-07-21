import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'

describe('google fonts', () => {
  let page: spec.Driver, destroyPage: () => Promise<void>, server: any, baseUrl: string

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
    server = await makeTestServer()
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await server.close()
    await destroyPage?.()
  })

  it('renders google font on ie correctly', async () => {
    await page.goto(`${baseUrl}/page-with-google-fonts/google-font.html`)

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'some app',
        testName: 'renders google font on IE correctly',
      },
    })

    await eyes.check({
      settings: {
        fully: true,
        renderers: [{name: 'ie', width: 640, height: 480}],
      },
    })

    await eyes.close()
    const results = await eyes.getResults()

    results.forEach(result => assert.strictEqual(result.status, 'Passed'))
  })

  it('renders correctly on ie and ios device', async () => {
    await page.goto(`${baseUrl}/page-with-google-fonts/google-fonts-icon.html`)
    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'some app',
        testName: 'renders google font on IE and iOS correctly',
      },
    })

    await eyes.check({
      settings: {
        fully: true,
        renderers: [
          {width: 640, height: 480, name: 'ie'},
          {iosDeviceInfo: {deviceName: 'iPhone 11', version: 'latest'}},
        ],
      },
    })

    await eyes.close()
    const results = await eyes.getResults()

    results.forEach(result => assert.strictEqual(result.status, 'Passed'))
  })
})
