import {makeCore} from '../../src/core'
import {readFileSync} from 'fs'
import nock from 'nock'
import assert from 'assert'

describe('check', () => {
  beforeEach(() => {
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
    nock('https://localhost:3000').get('/api/sessions/renderinfo').query({apiKey: 'my0api0key'}).reply(200, {})
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
        eyesServerUrl: 'https://localhost:3000',
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
          'Request "check" that was sent to the address "[POST]https://localhost:3000/api/sessions/running/test-id?apiKey=my0api0key" failed due to unexpected status (400)'
        )
      },
    )

    assert.strictEqual(checked, 1)
  })

  it('prevents new indexed steps step after abort', async () => {
    let checked = 0
    nock('https://localhost:3000').get('/api/sessions/renderinfo').query({apiKey: 'my0api0key'}).reply(200, {})
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
        eyesServerUrl: 'https://localhost:3000',
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

  it('crop image base on account info "maxImageHeight" and "maxImageArea"', async () => {
    const uploadUrl = 'https://localhost:3001'

    nock('https://localhost:3000')
      .get('/api/sessions/renderinfo')
      .query({apiKey: 'my0api0key'})
      .reply(() => {
        return [200, {maxImageHeight: 200, maxImageArea: 400000, uploadUrl}]
      })
    nock('https://localhost:3000')
      .post('/api/sessions/running/test-id')
      .query({apiKey: 'my0api0key'})
      .once()
      .reply((_url, body) => {
        return [200, {windowId: JSON.stringify(body), asExpected: true}]
      })
    nock(uploadUrl)
      .put(/.*/)
      .once()
      .reply(async (_url, body) => {
        // write crop image to file
        // const fs = await import('fs')
        // fs.writeFileSync('./test/fixtures/screenshot-crop.png', Buffer.from(body as string, 'hex'))

        const bufferImageSentToUpload = Buffer.from(body as string, 'hex')
        assert(
          // comparing the cropImage from fixture
          // to the image that sent to upload
          Buffer.compare(readFileSync('./test/fixtures/screenshot-crop.png'), bufferImageSentToUpload) === 0,
          'crop image need to be the same as the image sent to upload',
        )
        return [201, {}]
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
    await eyes.check({target: {image: './test/fixtures/screenshot.png'}})
  })
})
