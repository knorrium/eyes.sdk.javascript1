import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'

describe('data urls', () => {
  let page: spec.Driver, destroyPage: () => Promise<void>, server: any, baseUrl: string

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
    server = await makeTestServer()
    baseUrl = `http://localhost:${server.port}`
  })

  after(async () => {
    await destroyPage?.()
    await server.close()
  })

  it('produces correct snapshot for pages with data url as IMAGE in iframe', async () => {
    await page.goto(`${baseUrl}/page-with-data-urls/image-iframe.html`)

    const core = makeCore({spec, concurrency: 5})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core e2e',
        testName: 'data url image iframe',
      },
    })

    await eyes.check({settings: {fully: true}})

    await eyes.close()
    const [result] = await eyes.getResults()

    assert.strictEqual(result.status, 'Passed')
  })

  it('produces correct snapshot for pages with data url as HTML in iframes', async () => {
    await page.goto(`${baseUrl}/page-with-data-urls/html-iframe.html`)

    const core = makeCore({spec, concurrency: 5})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core e2e',
        testName: 'data url html iframe',
      },
    })

    await eyes.check({settings: {fully: true}})

    await eyes.close()
    const [result] = await eyes.getResults()

    assert.strictEqual(result.status, 'Passed')
  })
})
