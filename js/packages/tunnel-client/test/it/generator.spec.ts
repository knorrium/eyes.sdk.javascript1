import {makeGenerator} from '../../src/generator'
import {makeLogger} from '@applitools/logger'
import nock from 'nock'
import assert from 'assert'

describe('generator', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('works', async () => {
    const settings = {
      pollingServerUrl: 'https://tunnel.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
      envInfo: {os: 'Darwin', hostname: 'MacBook-Pro-Kyrylo.local', arch: 'x64', ram: 8589934592, node: 'v19.2.0'},
    }
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply((_url, body) => {
        assert.deepStrictEqual(body, {instance_info: settings.envInfo})
        return [200, {instance_id: 'instance-id'}]
      })

    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .matchHeader('x-secret', settings.secret)
      .reply((_url, body) => {
        assert.deepStrictEqual(body, {
          instance_id: 'instance-id',
          pending_tasks: [],
          completed_tasks: [],
          agent_status: 'OK',
        })
        return [200, {abort: true, abort_reason: 'reason'}]
      })

    const generator = makeGenerator({settings, logger: makeLogger()})

    const events = await generator.next([])

    assert.deepStrictEqual(events, {
      value: [{name: 'TunnelClient.close', payload: {reason: 'reason'}}],
      done: true,
    })
  })

  it('performs tasks', async () => {
    const settings = {
      pollingServerUrl: 'https://tunnel.server',
      pollingTimeout: 0,
      agentId: 'agent-id',
      secret: 'SeCrEt',
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
      .reply((_url, body) => {
        state += 1
        if (state === 1) {
          return [
            200,
            {
              tasks: [
                {id: 'task-id-1', type: 'CREATE_TUNNEL', apiKey: 'api-key', eyesServerUrl: 'eyes-url'},
                {
                  id: 'task-id-2',
                  type: 'REPLACE_TUNNEL',
                  tunnel_id: 'tunnel-id',
                  apiKey: 'api-key',
                  eyesServerUrl: 'eyes-url',
                },
                {
                  id: 'task-id-3',
                  type: 'DELETE_TUNNEL',
                  tunnel_id: 'tunnel-id',
                  apiKey: 'api-key',
                  eyesServerUrl: 'eyes-url',
                },
                {
                  id: 'task-id-4',
                  type: 'GET_RESOURCE',
                  resource_url: 'resource-url',
                },
              ],
            },
          ]
        } else if (state === 2) {
          assert.deepStrictEqual(body, {
            instance_id: 'instance-id',
            pending_tasks: [{id: 'task-id-1'}, {id: 'task-id-2'}, {id: 'task-id-3'}, {id: 'task-id-4'}],
            completed_tasks: [],
            agent_status: 'OK',
          })
          return [200, {tasks: []}]
        } else if (state === 3) {
          assert.deepStrictEqual(body, {
            instance_id: 'instance-id',
            pending_tasks: [],
            completed_tasks: [
              {id: 'task-id-1', status: 'SUCCESS', response: {tunnelId: 'new-tunnel-id'}},
              {id: 'task-id-2', status: 'SUCCESS', response: {tunnelId: 'replaced-tunnel-id'}},
              {id: 'task-id-3', status: 'SUCCESS'},
              {
                id: 'task-id-4',
                status: 'SUCCESS',
                response: {resource_content: Buffer.from('content').toString('base64')},
              },
            ],
            agent_status: 'OK',
          })
          return [200, {tasks: []}]
        }
      })

    const generator = makeGenerator({settings, logger: makeLogger()})

    const result1 = await generator.next([])
    assert.deepStrictEqual(result1, {
      value: [
        {
          key: 'task-id-1',
          name: 'TunnelClient.create',
          payload: {apiKey: 'api-key', eyesServerUrl: 'eyes-url'},
        },
        {
          key: 'task-id-2',
          name: 'TunnelClient.replace',
          payload: 'tunnel-id',
        },
        {
          key: 'task-id-3',
          name: 'TunnelClient.destroy',
          payload: 'tunnel-id',
        },
        {
          key: 'task-id-4',
          name: 'TunnelClient.fetch',
          payload: {resourceUrl: 'resource-url'},
        },
      ],
      done: false,
    })

    const result2 = await generator.next([])
    assert.deepStrictEqual(result2, {
      value: [],
      done: false,
    })

    const result3 = await generator.next([
      {
        key: 'task-id-1',
        name: 'TunnelClient.create',
        payload: {result: {tunnelId: 'new-tunnel-id', credentials: {apiKey: 'api-key', eyesServerUrl: 'eyes-url'}}},
      },
      {
        key: 'task-id-2',
        name: 'TunnelClient.replace',
        payload: {
          result: {tunnelId: 'replaced-tunnel-id', credentials: {apiKey: 'api-key', eyesServerUrl: 'eyes-url'}},
        },
      },
      {
        key: 'task-id-3',
        name: 'TunnelClient.destroy',
        payload: {result: undefined},
      },
      {
        key: 'task-id-4',
        name: 'TunnelClient.fetch',
        payload: {result: Buffer.from('content').toString('base64')},
      },
    ])
    assert.deepStrictEqual(result3, {
      value: [],
      done: false,
    })
  })

  it('sends events', async () => {
    const settings = {
      pollingServerUrl: 'https://tunnel.server',
      pollingTimeout: 0,
      agentId: 'agent-id',
      secret: 'SeCrEt',
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
      .reply((_url, body) => {
        state += 1
        if (state === 2) {
          assert.deepStrictEqual(body, {
            instance_id: 'instance-id',
            metrics: {
              metrics: 'blabla',
            },
            open_tunnels: [{id: 'tunnel-id-1'}, {id: 'tunnel-id-2'}, {id: 'tunnel-id-3'}],
            pending_tasks: [],
            completed_tasks: [],
            agent_status: 'OK',
          })
        }
        return [200, {tasks: []}]
      })

    const generator = makeGenerator({settings, logger: makeLogger()})

    const result1 = await generator.next([])
    assert.deepStrictEqual(result1, {
      value: [],
      done: false,
    })

    const result2 = await generator.next([
      {
        name: 'TunnelClient.metrics',
        payload: {metrics: 'blabla'},
      },
      {
        name: 'TunnelClient.list',
        payload: [{tunnelId: 'tunnel-id-1'}, {tunnelId: 'tunnel-id-2'}, {tunnelId: 'tunnel-id-3'}],
      },
    ])
    assert.deepStrictEqual(result2, {
      value: [],
      done: false,
    })
  })

  it('waits between polls', async () => {
    const settings = {
      pollingServerUrl: 'https://tunnel.server',
      pollingTimeout: 0,
      agentId: 'agent-id',
      secret: 'SeCrEt',
    }
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, {instance_id: 'instance-id'})

    let requiredDelay = 0
    let prevRequestTimestamp = Date.now()
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .matchHeader('x-secret', settings.secret)
      .reply(() => {
        const currentRequestTimestamp = Date.now()
        if (currentRequestTimestamp - prevRequestTimestamp < requiredDelay * 1000) {
          return [200, {abort: true, abort_reason: 'wrong delay'}]
        }
        prevRequestTimestamp = currentRequestTimestamp
        requiredDelay += 1
        return [200, {polling_interval_sec: requiredDelay, tasks: []}]
      })

    const generator = makeGenerator({settings, logger: makeLogger()})

    const result1 = await generator.next([])
    assert.deepStrictEqual(result1, {done: false, value: []})
    const result2 = await generator.next([])
    assert.deepStrictEqual(result2, {done: false, value: []})
    const result3 = await generator.next([])
    assert.deepStrictEqual(result3, {done: false, value: []})
  })

  it('waits between polls default amount of time', async () => {
    const settings = {
      pollingServerUrl: 'https://tunnel.server',
      pollingTimeout: 1_000,
      agentId: 'agent-id',
      secret: 'SeCrEt',
    }
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, {instance_id: 'instance-id'})

    let prevRequestTimestamp = 0
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .matchHeader('x-secret', settings.secret)
      .reply(() => {
        const currentRequestTimestamp = Date.now()
        if (currentRequestTimestamp - prevRequestTimestamp < 1_000) {
          return [200, {abort: true, abort_reason: 'wrong delay'}]
        }
        prevRequestTimestamp = currentRequestTimestamp
        return [200, {tasks: []}]
      })

    const generator = makeGenerator({settings, logger: makeLogger()})

    const result1 = await generator.next([])
    assert.deepStrictEqual(result1, {done: false, value: []})
    const result2 = await generator.next([])
    assert.deepStrictEqual(result2, {done: false, value: []})
    const result3 = await generator.next([])
    assert.deepStrictEqual(result3, {done: false, value: []})
  })

  it('handles unexpected server responses', async () => {
    const settings = {
      pollingServerUrl: 'https://tunnel.server',
      pollingTimeout: 0,
      agentId: 'agent-id',
      secret: 'SeCrEt',
    }
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, {instance_id: 'instance-id'})

    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, 'bla bla bla')

    const generator = makeGenerator({settings, logger: makeLogger()})

    const result1 = await generator.next([])
    assert.deepStrictEqual(result1, {done: false, value: []})
    const result2 = await generator.next([])
    assert.deepStrictEqual(result2, {done: false, value: []})
    const result3 = await generator.next([])
    assert.deepStrictEqual(result3, {done: false, value: []})
  })

  it('throws error after timeout', async () => {
    const settings = {
      pollingServerUrl: 'https://tunnel.server',
      pollingTimeout: 0,
      agentId: 'agent-id',
      secret: 'SeCrEt',
      timeout: 1000,
    }
    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/init`)
      .matchHeader('x-secret', settings.secret)
      .reply(200, {instance_id: 'instance-id'})

    nock(settings.pollingServerUrl)
      .persist()
      .post(`/tunnel-agents/${settings.agentId}/agentpoll`)
      .delay(1100)
      .reply(200, {abort: true})

    const generator = makeGenerator({settings, logger: makeLogger()})

    await assert.rejects(generator.next([]), (error: any) => {
      return error.name === 'ConnectionTimeoutError'
    })
  })
})
