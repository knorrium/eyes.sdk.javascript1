import {makeNMLRequests} from '../../src/server/requests'
import {makeLogger} from '@applitools/logger'
import nock from 'nock'
import assert from 'assert'

describe('requests', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('updates broker url on each request', async () => {
    let count = 0
    nock('http://broker-url.com')
      .post(path => path === `/message-${count}`)
      .times(3)
      .reply((_url, body) => {
        const payload =
          (body as any).name === 'TAKE_SNAPSHOT'
            ? {result: {resourceMap: {metadata: {}}, metadata: {}}}
            : {result: {screenshotUrl: ''}}

        nock('http://broker-url.com')
          .get(path => path === `/message-${count}-response`)
          .reply(() => [200, {payload, nextPath: `http://broker-url.com/message-${++count}`}])

        return [200]
      })

    const requests = makeNMLRequests({
      config: {brokerUrl: 'http://broker-url.com/message-0', agentId: 'nml-client'},
      logger: makeLogger(),
    })

    await requests.takeScreenshot({settings: {}})
    await requests.takeSnapshots({settings: {renderers: [{iosDeviceInfo: {deviceName: 'iPhone 12'}}]}})
    await requests.takeScreenshot({settings: {}})

    assert.strictEqual(count, 3)
  })
})
