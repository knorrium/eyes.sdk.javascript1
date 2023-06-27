import {makeLogger} from '@applitools/logger'
import {makeTunnelManager} from '../../src/tunnels/manager'
import nock from 'nock'
import assert from 'assert'

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
})
