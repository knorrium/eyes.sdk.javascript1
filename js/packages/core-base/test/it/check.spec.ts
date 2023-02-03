import {makeCore} from '../../src/core'
import nock from 'nock'
import assert from 'assert'

describe('check', () => {
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
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('prevents parallel processing of indexed steps', async () => {
    let checked = 0
    nock('https://localhost:3000')
      .post('/api/sessions/running/test-id')
      .query({apiKey: 'my0api0key'})
      .twice()
      .reply((_url, body) => {
        checked += 1
        return (body as any).options.name === 'error'
          ? [400]
          : [200, {windowId: JSON.stringify(body), asExpected: true}]
      })

    const core = makeCore({agentId: 'test-core'})

    const eyes = await core.openEyes({
      settings: {
        serverUrl: 'https://localhost:3000',
        apiKey: 'my0api0key',
        agentId: 'custom-agent',
        appName: 'My wonderful app',
        testName: 'My great test',
      },
    })

    await assert.rejects(
      Promise.all([
        eyes.check({
          target: {image: 'https://localhost:3000/image.png', isTransformed: true},
          settings: {name: 'error', stepIndex: 0},
        }),
        eyes.check({
          target: {image: 'https://localhost:3000/image2.png', isTransformed: true},
          settings: {stepIndex: 1},
        }),
      ]),
      error => {
        return (
          error.message ===
          'Request "check" that was sent to the address "[POST]https://localhost:3000/api/sessions/running/test-id?apiKey=my0api0key" failed due to unexpected status Bad Request(400)'
        )
      },
    )

    assert.strictEqual(checked, 1)
  })

  it('prevents new indexed steps step after abort', async () => {
    let checked = 0
    nock('https://localhost:3000')
      .post('/api/sessions/running/test-id')
      .query({apiKey: 'my0api0key'})
      .twice()
      .reply((_url, body) => {
        checked += 1
        return [200, {windowId: JSON.stringify(body), asExpected: true}]
      })
    nock('https://localhost:3000')
      .delete('/api/sessions/running/test-id')
      .query({apiKey: 'my0api0key', aborted: 'true'})
      .twice()
      .reply(() => {
        return [200, {}]
      })

    const core = makeCore({agentId: 'test-core'})

    const eyes = await core.openEyes({
      settings: {
        serverUrl: 'https://localhost:3000',
        apiKey: 'my0api0key',
        agentId: 'custom-agent',
        appName: 'My wonderful app',
        testName: 'My great test',
      },
    })

    await eyes.check({
      target: {image: 'https://localhost:3000/image.png', isTransformed: true},
      settings: {stepIndex: 0},
    })
    await eyes.abort()

    await assert.rejects(
      eyes.check({target: {image: 'https://localhost:3000/image2.png', isTransformed: true}, settings: {stepIndex: 1}}),
      error => {
        return error.message === 'Command "check" was aborted due to possible error in previous step'
      },
    )

    assert.strictEqual(checked, 1)
  })
})
