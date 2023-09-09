import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import * as utils from '@applitools/utils'
import assert from 'assert'

describe('abort', () => {
  it('handles abort with no started tests', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, base: fakeCore, clients: {ufg: fakeClient}})
    const eyes = await core.openEyes({
      settings: {eyesServerUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    let aborted = false
    fakeCore.emitter.on('abort', () => (aborted = true))

    await eyes.abort()
    const results = await eyes.getResults()
    assert.strictEqual(aborted, false)
    assert.deepStrictEqual(results.length, 0)
  })

  it('handles abort before render started', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore()
    const core = makeCore({concurrency: 5, base: fakeCore, clients: {ufg: fakeClient}})
    const eyes = await core.openEyes({
      settings: {eyesServerUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await eyes.check({
      target: {snapshot: {cdt: [], resourceContents: {}, resourceUrls: [], url: ''}},
      settings: {renderers: [{width: 100, height: 100}]},
    })

    let rendering = false
    fakeClient.emitter.on('beforeRender', () => (rendering = true))
    let aborted = false
    fakeCore.emitter.on('afterAbort', () => (aborted = true))

    await new Promise<void>(resolve => {
      fakeClient.emitter.on('afterGetRenderEnvironment', () => resolve(eyes.abort()))
    })

    const results = await eyes.getResults()

    assert.strictEqual(rendering, false)
    assert.strictEqual(aborted, true)
    assert.strictEqual(results.length, 1)
    assert.deepStrictEqual(
      results.map(result => result.isAborted),
      [true],
    )
  })

  it('handles abort during open base eyes', async () => {
    const fakeClient = makeFakeClient({
      hooks: {
        getRenderEnvironment: () => utils.general.sleep(0),
      },
    })
    const fakeCore = makeFakeCore({
      hooks: {
        openEyes: () => utils.general.sleep(0),
      },
    })
    const core = makeCore({concurrency: 5, base: fakeCore, clients: {ufg: fakeClient}})
    const eyes = await core.openEyes({
      settings: {eyesServerUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })
    await eyes.check({
      target: {snapshot: {cdt: [], resourceContents: {}, resourceUrls: [], url: ''}},
      settings: {renderers: [{width: 100, height: 100}]},
    })

    let opened = false
    fakeCore.emitter.on('afterOpenEyes', () => (opened = true))
    let checking = false
    fakeCore.emitter.on('afterCheck', () => (checking = true))
    let aborted = false
    fakeCore.emitter.on('afterAbort', () => (aborted = true))

    await new Promise<void>(resolve => {
      fakeCore.emitter.on('beforeOpenEyes', () => resolve(eyes.abort()))
    })

    const results = await eyes.getResults()

    assert.strictEqual(opened, true)
    assert.strictEqual(checking, false)
    assert.strictEqual(aborted, true)
    assert.strictEqual(results.length, 1)
    assert.deepStrictEqual(
      results.map(result => result.isAborted),
      [true],
    )
  })

  it('handles abort during check base eyes', async () => {
    const fakeClient = makeFakeClient({
      hooks: {
        getRenderEnvironment: () => utils.general.sleep(0),
      },
    })
    const fakeCore = makeFakeCore({
      hooks: {
        check: () => utils.general.sleep(0),
      },
    })
    const core = makeCore({concurrency: 5, base: fakeCore, clients: {ufg: fakeClient}})
    const eyes = await core.openEyes({
      settings: {eyesServerUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes.check({
      target: {snapshot: {cdt: [], resourceContents: {}, resourceUrls: [], url: ''}},
      settings: {renderers: [{width: 100, height: 100}]},
    })

    let checked = false
    fakeCore.emitter.on('afterCheck', () => (checked = true))
    let aborted = false
    fakeCore.emitter.on('afterAbort', () => (aborted = true))

    await new Promise<void>(resolve => {
      fakeCore.emitter.on('beforeCheck', () => resolve(eyes.abort()))
    })

    const results = await eyes.getResults()

    assert.strictEqual(checked, true)
    assert.strictEqual(aborted, true)
    assert.strictEqual(results.length, 1)
    assert.deepStrictEqual(
      results.map(result => result.isAborted),
      [true],
    )
  })
})
