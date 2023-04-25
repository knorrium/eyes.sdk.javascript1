import nock from 'nock'
import assert from 'assert'
import {makeLogger} from '@applitools/logger'
import {makeTunnelManager} from '../../src/tunnels/manager'

describe('tunnel-manager', () => {
  afterEach(async () => {
    nock.cleanAll()
  })

  it('creates new tunnel', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    nock('http://eg-tunnel').persist().post('/tunnels').reply(201, '"tunnel-id"')

    const {tunnelId} = await manager.create({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('creates new tunnel with retries', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    let retries = 0
    nock('http://eg-tunnel')
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

    const {tunnelId} = await manager.create({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('creates new tunnel with api key and server url', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    nock('http://eg-tunnel')
      .persist()
      .post('/tunnels')
      .reply(function () {
        const apiKeyHeader = this.req.headers['x-eyes-api-key']
        const serverUrlHeader = this.req.headers['x-eyes-server-url']
        if (apiKeyHeader === 'api-key' && serverUrlHeader === 'http://eyes-server') {
          return [201, `"tunnel-id"`]
        }
        return [401, {message: 'UNAUTHORIZED'}]
      })

    const {tunnelId} = await manager.create({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('throws when tunnel was not created', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    nock('http://eg-tunnel').persist().post('/tunnels').reply(401, {message: 'UNAUTHORIZED'})

    assert.rejects(manager.create({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'}), (err: Error) =>
      err.message.includes('UNAUTHORIZED'),
    )
  })

  it('destroys tunnel', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    nock('http://eg-tunnel').persist().delete('/tunnels/tunnel-id').reply(200)

    await manager.destroy({
      tunnelId: 'tunnel-id',
      credentials: {eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'},
    })
  })

  it('destroys tunnel with api key and server url', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    nock('http://eg-tunnel')
      .persist()
      .delete('/tunnels/tunnel-id')
      .reply(function () {
        const apiKeyHeader = this.req.headers['x-eyes-api-key']
        const eyesServerUrlHeader = this.req.headers['x-eyes-server-url']
        if (apiKeyHeader === 'api-key' && eyesServerUrlHeader === 'http://eyes-server') {
          return [200]
        }
        return [401, {message: 'UNAUTHORIZED'}]
      })

    await manager.destroy({
      tunnelId: 'tunnel-id',
      credentials: {eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'},
    })
  })

  it('throws when tunnel was not destroyed', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    nock('http://eg-tunnel').persist().delete('/tunnels/tunnel-id').reply(404, {message: 'TUNNEL_NOT_FOUND'})

    await assert.rejects(
      manager.destroy({tunnelId: 'tunnel-id', credentials: {eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'}}),
      (err: Error) => err.message.includes('TUNNEL_NOT_FOUND'),
    )
  })

  it('acquires tunnels', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    nock('http://eg-tunnel').persist().post('/tunnels').reply(201, '"tunnel-id"')

    const [{tunnelId}] = await manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('acquires tunnels that were previously created', async () => {
    const manager = await makeTunnelManager({settings: {serverUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    let tunnelIndex = 0
    nock('http://eg-tunnel')
      .persist()
      .post('/tunnels')
      .reply(() => [201, `"tunnel-id-${tunnelIndex++}"`])
    nock('http://eg-tunnel')
      .persist()
      .delete(/\/tunnels\/tunnel-id-\d+/)
      .reply(200)

    const tunnels = await manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})
    await manager.release(tunnels)
    const reusedTunnels = await manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})

    assert.deepStrictEqual(reusedTunnels, tunnels)
  })
})
