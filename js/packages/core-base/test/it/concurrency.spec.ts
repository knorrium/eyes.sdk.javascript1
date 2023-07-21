import {makeCore} from '../../src/core'
import nock from 'nock'
import assert from 'assert'
import * as utils from '@applitools/utils'

describe('concurrency', () => {
  beforeEach(() => {
    nock('https://localhost:3000').get('/api/sessions/renderinfo').query({apiKey: 'api-key'}).reply(200, {}).persist()
    nock('https://localhost:3000')
      .post('/api/sessions/running/test-id')
      .query({apiKey: 'api-key'})
      .reply((_url, body) => {
        return [200, {windowId: JSON.stringify(body), asExpected: true}]
      })
      .persist()
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('prevents eyes from open if concurrency slot is not available', async () => {
    const counters = {eyesOpened: 0, eyesClosed: 0}
    nock('https://localhost:3000')
      .post('/api/sessions/running')
      .query({apiKey: 'api-key'})
      .reply(async (_url, body) => {
        await utils.general.sleep(50)
        counters.eyesOpened += 1
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
      .persist()
    nock('https://localhost:3000')
      .delete('/api/sessions/running/test-id')
      .query({apiKey: 'api-key', aborted: false})
      .reply(async () => {
        await utils.general.sleep(50)
        counters.eyesClosed += 1
        return [200, {status: 'Passed'}]
      })
      .persist()

    const core = makeCore({concurrency: 1})

    const eyesPromise1 = core.openEyes({
      settings: {
        eyesServerUrl: 'https://localhost:3000',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })
    const eyesPromise2 = core.openEyes({
      settings: {
        eyesServerUrl: 'https://localhost:3000',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
      },
    })

    // t0 - nothing happened
    await utils.general.sleep(0)
    assert.deepStrictEqual(counters, {eyesOpened: 0, eyesClosed: 0})
    // t1 - eyes1 opened
    const eyes1 = await eyesPromise1
    assert.deepStrictEqual(counters, {eyesOpened: 1, eyesClosed: 0})
    await eyes1.close()
    await eyes1.getResults()
    // t2 - eyes1 closed
    assert.deepStrictEqual(counters, {eyesOpened: 1, eyesClosed: 1})
    // t3 - eyes2 opened
    await utils.general.sleep(60)
    assert.deepStrictEqual(counters, {eyesOpened: 2, eyesClosed: 1})
    // t4 - eyes2 closed
    const eyes2 = await eyesPromise2
    await eyes2.close()
    await eyes2.getResults()
    assert.deepStrictEqual(counters, {eyesOpened: 2, eyesClosed: 2})
  })
})
