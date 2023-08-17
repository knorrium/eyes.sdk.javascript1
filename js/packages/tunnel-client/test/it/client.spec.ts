import {makeLogger} from '@applitools/logger'
import {makeTunnelClient} from '../../src/client'
import nock from 'nock'
import assert from 'assert'
import * as utils from '@applitools/utils'

describe('client', () => {
  afterEach(async () => {
    nock.cleanAll()
  })

  it('creates new tunnel', async () => {
    const client = await makeTunnelClient({settings: {serviceUrl: 'http://service.tunnels.ec'}, logger: makeLogger()})

    nock('http://service.tunnels.ec').persist().post('/tunnels').reply(201, '"tunnel-id"')

    const {tunnelId} = await client.create({eyesServerUrl: 'http://server.eyes', apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('creates new tunnel with retries', async () => {
    const manager = await makeTunnelClient({settings: {serviceUrl: 'http://service.tunnels.ec'}, logger: makeLogger()})

    let retries = 0
    nock('http://service.tunnels.ec')
      .persist()
      .post('/tunnels')
      .reply(() => {
        retries += 1
        if (retries <= 2) {
          return [
            retries === 1 ? 403 : 503,
            {message: retries === 1 ? 'CONCURRENCY_LIMIT_REACHED' : 'NO_AVAILABLE_TUNNEL_PROXY'},
          ]
        }
        return [201, '"tunnel-id"']
      })

    const {tunnelId} = await manager.create({eyesServerUrl: 'http://server.eyes', apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('creates new tunnel with api key and server url', async () => {
    const manager = await makeTunnelClient({settings: {serviceUrl: 'http://service.tunnels.ec'}, logger: makeLogger()})

    nock('http://service.tunnels.ec')
      .persist()
      .post('/tunnels')
      .reply(function () {
        const apiKeyHeader = this.req.headers['x-eyes-api-key']
        const serverUrlHeader = this.req.headers['x-eyes-server-url']
        if (apiKeyHeader === 'api-key' && serverUrlHeader === 'http://server.eyes') {
          return [201, `"tunnel-id"`]
        }
        return [401, {message: 'UNAUTHORIZED'}]
      })

    const {tunnelId} = await manager.create({eyesServerUrl: 'http://server.eyes', apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('throws when tunnel was not created', async () => {
    const manager = await makeTunnelClient({settings: {serviceUrl: 'http://service.tunnels.ec'}, logger: makeLogger()})

    nock('http://service.tunnels.ec').persist().post('/tunnels').reply(401, {message: 'UNAUTHORIZED'})

    assert.rejects(manager.create({eyesServerUrl: 'http://server.eyes', apiKey: 'api-key'}), (err: Error) =>
      err.message.includes('UNAUTHORIZED'),
    )
  })

  it('queue create new tunnel requests if they need retry', async () => {
    const manager = await makeTunnelClient({settings: {serviceUrl: 'http://service.tunnels.ec'}, logger: makeLogger()})

    let runningCount = 0
    let requestingCount = 0
    let isOverload = false
    nock('http://service.tunnels.ec')
      .persist()
      .post('/tunnels')
      .reply(async () => {
        try {
          requestingCount += 1
          if (runningCount < 2) {
            runningCount += 1
            if (runningCount >= 2) {
              utils.general.sleep(2_000)?.then(() => (isOverload = true))
            }
            utils.general.sleep(10_000)?.then(() => ((runningCount -= 1), (isOverload = false)))
            return [201, JSON.stringify('tunnel-id')]
          }

          await utils.general.sleep(1)
          return [500, {message: requestingCount > 1 && isOverload ? 'TOO_MANY_REQUESTS' : 'NO_AVAILABLE_TUNNEL_PROXY'}]
        } finally {
          requestingCount -= 1
        }
      })

    await Promise.all(
      Array.from({length: 3}).map(async (_, _index) => {
        await manager.create({eyesServerUrl: 'http://server.eyes', apiKey: 'api-key'})
      }),
    )
  })

  it('destroys tunnel with api key and server url', async () => {
    const manager = await makeTunnelClient({settings: {serviceUrl: 'http://service.tunnels.ec'}, logger: makeLogger()})

    nock('http://service.tunnels.ec')
      .persist()
      .post('/tunnels')
      .reply(function () {
        const apiKeyHeader = this.req.headers['x-eyes-api-key']
        const serverUrlHeader = this.req.headers['x-eyes-server-url']
        if (apiKeyHeader === 'api-key' && serverUrlHeader === 'http://server.eyes') {
          return [201, `"tunnel-id"`]
        }
        return [401, {message: 'UNAUTHORIZED'}]
      })

    nock('http://service.tunnels.ec')
      .persist()
      .delete('/tunnels/tunnel-id')
      .reply(function () {
        const apiKeyHeader = this.req.headers['x-eyes-api-key']
        const eyesServerUrlHeader = this.req.headers['x-eyes-server-url']
        if (apiKeyHeader === 'api-key' && eyesServerUrlHeader === 'http://server.eyes') {
          return [200]
        }
        return [401, {message: 'UNAUTHORIZED'}]
      })

    const tunnel = await manager.create({apiKey: 'api-key', eyesServerUrl: 'http://server.eyes'})
    await manager.destroy(tunnel.tunnelId)
  })

  it('throws when tunnel was not destroyed', async () => {
    const manager = await makeTunnelClient({settings: {serviceUrl: 'http://service.tunnels.ec'}, logger: makeLogger()})

    nock('http://service.tunnels.ec').persist().post('/tunnels').reply(201, `"tunnel-id"`)
    nock('http://service.tunnels.ec').persist().delete('/tunnels/tunnel-id').reply(404, {message: 'TUNNEL_NOT_FOUND'})

    const tunnel = await manager.create({apiKey: 'api-key', eyesServerUrl: 'http://server.eyes'})
    await assert.rejects(manager.destroy(tunnel.tunnelId), (err: Error) => err.message.includes('TUNNEL_NOT_FOUND'))
  })

  it('throws when tunnel was not found', async () => {
    const manager = await makeTunnelClient({settings: {serviceUrl: 'http://service.tunnels.ec'}, logger: makeLogger()})

    nock('http://service.tunnels.ec').persist().delete('/tunnels/tunnel-id').reply(404, {message: 'TUNNEL_NOT_FOUND'})

    await assert.rejects(manager.destroy('unknown-tunnel-id'))
  })
})
