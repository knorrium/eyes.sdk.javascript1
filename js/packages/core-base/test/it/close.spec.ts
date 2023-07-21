import {makeCore} from '../../src/core'
import * as utils from '@applitools/utils'
import nock from 'nock'

describe('close', () => {
  beforeEach(() => {
    nock('https://localhost:3000').get('/api/sessions/renderinfo').query({apiKey: 'my0api0key'}).reply(200, {})
    nock('https://localhost:3000')
      .post('/api/sessions/running')
      .query({apiKey: 'my0api0key'})
      .reply((_url, body) => {
        return [
          201,
          {
            id: 'test-id',
            batchId: 'server-batch-id',
            baselineId: 'baseline-id',
            sessionId: 'session-id',
            url: JSON.stringify(body),
            isNew: true,
          },
        ]
      })
    nock('https://localhost:3000')
      .post('/api/sessions/running/test-id')
      .query({apiKey: 'my0api0key'})
      .twice()
      .reply((_url, body) => {
        return [200, {windowId: JSON.stringify(body), asExpected: true}]
      })
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('waits for report response before closing the session', async () => {
    let reported = false
    nock('https://localhost:3000')
      .put('/api/sessions/running/test-id/selfhealdata')
      .query({apiKey: 'my0api0key'})
      .reply(async () => {
        await utils.general.sleep(100)
        reported = true
        return [200]
      })
    nock('https://localhost:3000')
      .delete('/api/sessions/running/test-id')
      .query({apiKey: 'my0api0key', aborted: false})
      .reply(() => {
        return reported ? [200, {status: 'Passed'}] : [500]
      })

    const core = makeCore({agentId: 'test-core'})

    const eyes = await core.openEyes({
      settings: {
        eyesServerUrl: 'https://localhost:3000',
        apiKey: 'my0api0key',
        agentId: 'custom-agent',
        appName: 'My wonderful app',
        testName: 'My great test',
      },
    })
    await eyes.check({target: {image: 'https://images.applitools.com/image.com', isTransformed: true}})
    await eyes.close({
      settings: {
        testMetadata: [
          {
            successfulSelector: {using: 'xpath', value: '//blah'},
            originalSelector: {using: 'css selector', value: '#blah'},
          },
        ],
      },
    })
    await eyes.getResults()
  })
})
