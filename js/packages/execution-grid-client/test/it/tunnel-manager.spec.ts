import {makeLogger} from '@applitools/logger'
import {makeTunnelManager} from '../../src/tunnels/manager'
import nock from 'nock'
import assert from 'assert'
import * as utils from '@applitools/utils'

describe('tunnel-manager', () => {
  afterEach(async () => {
    nock.cleanAll()
  })

  it('acquires tunnels', async () => {
    const manager = await makeTunnelManager({settings: {serviceUrl: 'http://eg-tunnel'}, logger: makeLogger()})

    nock('http://eg-tunnel').persist().post('/tunnels').reply(201, '"tunnel-id"')

    const [{tunnelId}] = await manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})

    assert.strictEqual(tunnelId, 'tunnel-id')
  })

  it('acquires tunnels in parallel', async () => {
    const manager = await makeTunnelManager({
      settings: {serviceUrl: 'http://eg-tunnel', pool: {maxInuse: 2}},
      logger: makeLogger(),
    })

    let count = 0
    nock('http://eg-tunnel')
      .persist()
      .post('/tunnels')
      .reply(() => [201, `"tunnel-id-${++count}"`])

    const [[tunnel1], [tunnel2], [tunnel3]] = await Promise.all([
      manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'}),
      manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'}),
      manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'}),
    ])

    assert.strictEqual(tunnel1.tunnelId, tunnel2.tunnelId)
    assert.notStrictEqual(tunnel1.tunnelId, tunnel3.tunnelId)
  })

  it('acquires tunnels that were previously created', async () => {
    const manager = await makeTunnelManager({settings: {serviceUrl: 'http://eg-tunnel'}, logger: makeLogger()})

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

  it('does not acquire expired tunnels', async () => {
    const manager = await makeTunnelManager({
      settings: {serviceUrl: 'http://eg-tunnel', pool: {timeout: {expiration: 2_000}}},
      logger: makeLogger(),
    })

    let tunnelIndex = 0
    nock('http://eg-tunnel')
      .persist()
      .post('/tunnels')
      .reply(() => [201, `"tunnel-id-${tunnelIndex++}"`])
    nock('http://eg-tunnel')
      .persist()
      .delete(/\/tunnels\/tunnel-id-\d+/)
      .reply(200)

    const tunnels1 = await manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})
    const tunnels2 = await manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})

    await utils.general.sleep(2_000)

    const tunnels3 = await manager.acquire({eyesServerUrl: 'http://eyes-server', apiKey: 'api-key'})

    await manager.release(tunnels1)
    await manager.release(tunnels2)
    await manager.release(tunnels3)

    assert.deepStrictEqual(tunnels1, tunnels2)
    assert.notDeepStrictEqual(tunnels1, tunnels3)
  })
})
