import {makeTunnelClientWorker} from '../../src/worker'
import {makeLogger} from '@applitools/logger'
import nock from 'nock'
import assert from 'assert'
import * as utils from '@applitools/utils'

describe('worker', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('performs create command', async () => {
    const settings = {
      pollingServerUrl: 'https://polling.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
      pollingTimeout: 500,
      timeout: 1000,
    }

    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, {instance_id: 'instance-id'})

    let state = 0
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .matchHeader('x-secret', settings.secret)
      .reply(async (_url, body) => {
        try {
          state += 1
          if (state === 1) {
            return [
              200,
              {
                tasks: [
                  {
                    id: 'task-1',
                    type: 'CREATE_TUNNEL',
                    eyesServerUrl: 'https://eyesapi.applitools.com',
                    apiKey: process.env.APPLITOOLS_API_KEY,
                  },
                ],
              },
            ]
          } else if (state < 10 && (body as any).pending_tasks.length > 0) {
            assert.deepStrictEqual(body, {
              instance_id: 'instance-id',
              pending_tasks: [{id: 'task-1'}],
              completed_tasks: [],
              agent_status: 'OK',
            })
            return [200, {tasks: []}]
          } else {
            assert.deepStrictEqual(JSON.parse(JSON.stringify(body).replace(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/, 'guid')), {
              instance_id: 'instance-id',
              pending_tasks: [],
              completed_tasks: [{id: 'task-1', status: 'SUCCESS', response: {tunnelId: 'guid'}}],
              agent_status: 'OK',
            })
            return [200, {abort: true, abort_reason: 'passed'}]
          }
        } catch (error: any) {
          return [200, {abort: true, abort_reason: error.message}]
        }
      })

    const socket = makeTunnelClientWorker({settings, logger: makeLogger()})

    await socket.wait('TunnelClient.close', async reason => {
      assert.deepStrictEqual(reason, {reason: 'passed'})
    })
  })

  it('performs fetch command', async () => {
    const settings = {
      serviceUrl: 'https://tunnel.service',
      pollingServerUrl: 'https://polling.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
      pollingTimeout: 500,
      timeout: 1000,
    }

    const sitemap = `<?xml version = "1.0" encoding = "UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc> http://example.com </loc>
    <lastmod> 2005-01-01 </lastmod>
    <changefreq> monthly </changefreq>
    <priority> 0.8 </priority>
  </url>
</urlset>
`

    nock('https://site.with.sitemap').get(`/sitemap.xml`).reply(200, sitemap)

    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, {instance_id: 'instance-id'})

    let state = 0
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .matchHeader('x-secret', settings.secret)
      .reply(async (_url, body) => {
        try {
          state += 1
          if (state === 1) {
            return [
              200,
              {tasks: [{id: 'task-1', type: 'GET_RESOURCE', resource_url: 'https://site.with.sitemap/sitemap.xml'}]},
            ]
          } else if (state === 2) {
            assert.deepStrictEqual(body, {
              instance_id: 'instance-id',
              pending_tasks: [{id: 'task-1'}],
              completed_tasks: [],
              agent_status: 'OK',
            })
            return [200, {tasks: []}]
          } else if (state === 3) {
            assert.deepStrictEqual(body, {
              instance_id: 'instance-id',
              pending_tasks: [],
              completed_tasks: [
                {
                  id: 'task-1',
                  status: 'SUCCESS',
                  response: {resource_content: Buffer.from(sitemap).toString('base64')},
                },
              ],
              agent_status: 'OK',
            })
            return [200, {abort: true, abort_reason: 'passed'}]
          } else {
            return [200, {abort: true, abort_reason: 'failed'}]
          }
        } catch (error: any) {
          return [200, {abort: 200, abort_reason: error.message}]
        }
      })

    const socket = makeTunnelClientWorker({settings, logger: makeLogger()})

    await socket.wait('TunnelClient.close', async reason => {
      assert.deepStrictEqual(reason, {reason: 'passed'})
    })
  })

  it('ends with an error when server is not responsive', async () => {
    const settings = {
      serviceUrl: 'https://tunnel.service',
      pollingServerUrl: 'https://polling.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
      pollingTimeout: 500,
      timeout: 1000,
    }
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .delay(1100)
      .reply(200)

    const socket = makeTunnelClientWorker({settings, logger: makeLogger()})

    await socket.wait('error', error => {
      assert.strictEqual(error.name, 'ConnectionTimeoutError')
    })
  })

  it('ends with an error when the server stop being responsive', async () => {
    const settings = {
      serviceUrl: 'https://tunnel.service',
      pollingServerUrl: 'https://polling.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
      pollingTimeout: 500,
      timeout: 1000,
    }

    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, {instance_id: 'instance-id'})

    let state = 0
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .matchHeader('x-secret', settings.secret)
      .reply(async () => {
        state += 1
        if (state > 5) await utils.general.sleep(1100)
        return [200, {tasks: []}]
      })

    const socket = makeTunnelClientWorker({settings, logger: makeLogger()})

    await socket.wait('error', error => {
      assert.strictEqual(error.name, 'ConnectionTimeoutError')
    })
  })

  it('ends with a reason when server commanded so', async () => {
    const settings = {
      serviceUrl: 'https://tunnel.service',
      pollingServerUrl: 'https://polling.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
      pollingTimeout: 500,
      timeout: 1000,
    }

    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, {instance_id: 'instance-id'})

    let state = 0
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .matchHeader('x-secret', settings.secret)
      .reply(async () => {
        state += 1
        if (state > 5) return [200, {abort: true, abort_reason: 'abort test'}]
        return [200, {tasks: []}]
      })

    const socket = makeTunnelClientWorker({settings, logger: makeLogger()})

    await socket.wait('TunnelClient.close', payload => {
      assert.deepStrictEqual(payload, {reason: 'abort test'})
    })
  })
})
