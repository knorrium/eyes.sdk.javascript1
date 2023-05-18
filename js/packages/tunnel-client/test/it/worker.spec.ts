import {makeTunnelClientWorker} from '../../src/worker'
import {makeLogger} from '@applitools/logger'
import nock from 'nock'
import assert from 'assert/strict'
import * as utils from '@applitools/utils'

describe('worker', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('ends with an error when server is not responsive', async () => {
    const settings = {
      serviceUrl: 'https://tunnel.service',
      pollingServerUrl: 'https://polling.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
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
      assert.equal(error.name, 'AbortError')
    })
  })

  it('ends with an error when the server stop being responsive', async () => {
    const settings = {
      serviceUrl: 'https://tunnel.service',
      pollingServerUrl: 'https://polling.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
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
      assert.equal(error.name, 'AbortError')
    })
  })

  it('ends with a reason when server commanded so', async () => {
    const settings = {
      serviceUrl: 'https://tunnel.service',
      pollingServerUrl: 'https://polling.server',
      agentId: 'agent-id',
      secret: 'SeCrEt',
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
      assert.deepEqual(payload, {reason: 'abort test'})
    })
  })
})
