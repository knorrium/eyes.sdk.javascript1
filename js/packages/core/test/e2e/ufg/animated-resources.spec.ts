import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'

describe('animated resources', () => {
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

  it('renders screenshot with frozen gif', async () => {
    await page.goto(`${baseUrl}/page-animated-resources/index.html`)

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'some app',
        testName: 'frozen gif',
      },
    })

    await eyes.check({settings: {fully: true}})

    await eyes.close()
    const results = await eyes.getResults()

    results.forEach(result => assert.strictEqual(result.status, 'Passed'))
  })
})
