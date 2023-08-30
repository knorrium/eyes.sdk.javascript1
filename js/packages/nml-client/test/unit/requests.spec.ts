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
    nock('http://renderer-env-url.com').get('/').reply(200, {})

    nock('http://broker-url.com')
      .post(path => path === `/message-${count}`)
      .times(3)
      .reply((_url, body) => {
        const response: any = {nextPath: `http://broker-url.com/message-${count + 1}`}
        if (count === 0) {
          response.payload = {error: {message: 'Oops! Something went wrong.'}}
        } else {
          response.payload =
            (body as any).name === 'TAKE_SNAPSHOT'
              ? {result: {resourceMap: {metadata: {}}, metadata: {}}}
              : {result: {screenshotUrl: ''}}
        }

        nock('http://broker-url.com')
          .get(`/message-${count}-response`)
          .reply(() => {
            count += 1
            return [200, response]
          })

        return [200]
      })

    const requests = makeNMLRequests({
      settings: {
        brokerUrl: 'http://broker-url.com/message-0',
        renderEnvironmentsUrl: 'http://renderer-env-url.com',
        agentId: 'nml-client',
      },
      logger: makeLogger(),
    })

    await assert.rejects(requests.takeScreenshots({settings: {renderers: [{environment: {}}]}}))
    await requests.takeSnapshots({settings: {renderers: [{iosDeviceInfo: {deviceName: 'iPhone 12'}}]}})
    await requests.takeScreenshots({settings: {renderers: [{environment: {}}]}})

    assert.strictEqual(count, 3)
  })
})
