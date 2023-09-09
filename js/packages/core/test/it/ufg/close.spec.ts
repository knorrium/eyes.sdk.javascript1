import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import assert from 'assert'

describe('close', async () => {
  it('handles close with no opened eyes', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, base: fakeCore, clients: {ufg: fakeClient}})
    const eyes = await core.openEyes({
      settings: {eyesServerUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    let closed = false
    fakeCore.emitter.on('abort', () => (closed = true))

    await eyes.close()
    const results = await eyes.getResults()

    assert.strictEqual(closed, false)
    assert.deepStrictEqual(results.length, 0)
  })

  it('aborts if eyes throw during close', async () => {
    const fakeCore = makeFakeCore({
      hooks: {
        close() {
          throw new Error('close')
        },
      },
    })
    const fakeClient = makeFakeClient()

    const core = makeCore({concurrency: 1, base: fakeCore as any, clients: {ufg: fakeClient}})

    const eyes1 = await core.openEyes({
      settings: {eyesServerUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes1.check({
      target: {snapshot: {cdt: [], resourceContents: {}, resourceUrls: [], url: ''}},
      settings: {renderers: [{name: 'chrome', width: 100, height: 100}]},
    })
    await eyes1.close()
    const [result1] = await eyes1.getResults()
    assert.strictEqual(result1.isAborted, true)
  })
})
