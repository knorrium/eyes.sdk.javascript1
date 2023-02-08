import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import assert from 'assert'

describe('close', async () => {
  it('handles close with no started tests', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, core: fakeCore, client: fakeClient})
    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    let closed = false
    fakeCore.emitter.on('abort', () => (closed = true))

    await eyes.close()
    const results = await eyes.getResults()

    assert.strictEqual(closed, false)
    assert.deepStrictEqual(results.length, 0)
  })
})
