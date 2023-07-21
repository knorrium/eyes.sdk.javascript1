import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import {makeTunnelClient} from '@applitools/tunnel-client'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'

describe('resource fetching from tunnel', () => {
  let tunnelClient: any, page: spec.Driver, destroyPage: () => Promise<void>, server: any, baseUrl: string

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
    server = await makeTestServer()
    baseUrl = `http://localhost:${server.port}`
    tunnelClient = makeTunnelClient({settings: {tunnelServerUrl: 'https://exec-wus.applitools.com'}})
    const tunnel = await tunnelClient.create({
      eyesServerUrl: 'https://eyesapi.applitools.com',
      apiKey: process.env.APPLITOOLS_API_KEY!,
    })
    process.env.APPLITOOLS_TUNNEL_IDS = tunnel.tunnelId
  })

  after(async () => {
    process.env.APPLITOOLS_FETCH_RESOURCE_FROM_TUNNEL = undefined
    process.env.APPLITOOLS_TUNNEL_IDS = undefined
    await server?.close()
    await destroyPage?.()
    await tunnelClient.close()
  })

  it('works when enabled by env var', async () => {
    process.env.APPLITOOLS_FETCH_RESOURCE_FROM_TUNNEL = 'true'
    await page.goto(`${baseUrl}/fetch-concurrency/index.html`)
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'resource-handler works',
        testName: 'resource-handler works',
      },
    })
    await eyes.check({settings: {renderers: [{name: 'chrome', width: 800, height: 600}], disableBrowserFetching: true}})
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.isDifferent, false)
  })
})
