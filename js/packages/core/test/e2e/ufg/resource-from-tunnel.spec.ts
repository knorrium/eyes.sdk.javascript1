import {makeCore} from '../../../src/ufg/core'
import {makeTestServer} from '@applitools/test-server'
import {makeTunnelClient} from '@applitools/tunnel-client'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'
import * as utils from '@applitools/utils'

describe('resource fetching from tunnel', () => {
  let tunnel: any, page: spec.Driver, destroyPage: () => Promise<void>, server: any, baseUrl: string

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
    server = await makeTestServer({})
    baseUrl = `http://localhost:${server.port}`
    tunnel = makeTunnelClient({})
    await tunnel.create({
      eyesServerUrl:
        utils.general.getEnvValue('EYES_SERVER_URL') ??
        utils.general.getEnvValue('SERVER_URL') ??
        'https://eyesapi.applitools.com',
      apiKey: utils.general.getEnvValue('API_KEY'),
    })
    const tunnels = await tunnel.list()
    process.env.APPLITOOLS_TUNNEL_IDS = tunnels.map((tunnel: any) => tunnel.tunnelId).join(',')
  })

  after(async () => {
    process.env.APPLITOOLS_FETCH_RESOURCE_FROM_TUNNEL = undefined
    process.env.APPLITOOLS_TUNNEL_IDS = undefined
    await server?.close()
    await destroyPage?.()
    await tunnel.close()
  })

  it('works when enabled by env var', async () => {
    process.env.APPLITOOLS_FETCH_RESOURCE_FROM_TUNNEL = 'true'
    await page.goto(`${baseUrl}/fetch-concurrency/index.html`)
    const core = makeCore({spec, concurrency: 10})
    const eyes = await core.openEyes({
      target: page,
      settings: {
        serverUrl: 'https://eyesapi.applitools.com',
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
