import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import * as utils from '@applitools/utils'
import assert from 'assert'

describe('concurrency', () => {
  it('waits for base eyes to open before start rendering', async () => {
    const counters = {baseOpenEyes: 0, baseCheck: 0, bookRenderer: 0, render: 0}

    const fakeCore = makeFakeCore({
      hooks: {
        async openEyes() {
          await utils.general.sleep(50)
          counters.baseOpenEyes++
        },
        async check() {
          await utils.general.sleep(50)
          counters.baseCheck++
        },
      },
    })
    const fakeClient = makeFakeClient({
      hooks: {
        async bookRenderer() {
          await utils.general.sleep(50)
          counters.bookRenderer++
        },
        async render() {
          await utils.general.sleep(50)
          counters.render++
        },
      },
    })

    const core = makeCore({concurrency: 1, core: fakeCore as any, client: fakeClient as any})

    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    // t0 - nothing happened
    await utils.general.sleep(0)
    assert.deepStrictEqual(counters, {baseOpenEyes: 0, baseCheck: 0, bookRenderer: 0, render: 0})
    await eyes.check({
      target: {cdt: []},
      settings: {renderers: [{name: 'chrome', width: 100, height: 100}]},
    })
    //t1 - renderer booked
    await utils.general.sleep(60)
    assert.deepStrictEqual(counters, {baseOpenEyes: 0, baseCheck: 0, bookRenderer: 1, render: 0})
    //t2 - eyes opened
    await utils.general.sleep(60)
    assert.deepStrictEqual(counters, {baseOpenEyes: 1, baseCheck: 0, bookRenderer: 1, render: 0})
    //t3 - snapshot rendered
    await utils.general.sleep(60)
    assert.deepStrictEqual(counters, {baseOpenEyes: 1, baseCheck: 0, bookRenderer: 1, render: 1})
    //t4 - target checked
    await utils.general.sleep(60)
    assert.deepStrictEqual(counters, {baseOpenEyes: 1, baseCheck: 1, bookRenderer: 1, render: 1})

    await eyes.close()
    await eyes.getResults()
  })

  it('prevents base eyes from open if concurrency slot is not available', async () => {
    const counters = {openEyes: {1: 0, 2: 0, 3: 0}}

    const fakeCore = makeFakeCore()
    fakeCore.emitter.on('beforeOpenEyes', ({settings}) => {
      counters.openEyes[settings.testName as 1 | 2 | 3] += 1
    })
    const fakeClient = makeFakeClient()

    const core = makeCore({concurrency: 2, core: fakeCore as any, client: fakeClient as any})

    const eyes = await Promise.all([
      core.openEyes({settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: '1'}}),
      core.openEyes({settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: '2'}}),
      core.openEyes({settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: '3'}}),
    ])

    // t1 - trying to open base eyes 3 times with concurrency 2
    await eyes[0].check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes[1].check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes[2].check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await utils.general.sleep(0)
    assert.deepStrictEqual(counters, {openEyes: {1: 1, 2: 1, 3: 0}})

    // t2 - releasing concurrency slot by closing one of the previously opened eyes
    await eyes[1].close()
    await eyes[1].getResults()
    assert.deepStrictEqual(counters, {openEyes: {1: 1, 2: 1, 3: 1}})

    await eyes[0].close()
    await eyes[0].getResults()
    await eyes[2].close()
    await eyes[2].getResults()
  })

  it('releases concurrency slot if eyes throw during close', async () => {
    const fakeCore = makeFakeCore({
      hooks: {
        close() {
          throw new Error('close')
        },
      },
    })
    const fakeClient = makeFakeClient()

    const core = makeCore({concurrency: 1, core: fakeCore as any, client: fakeClient as any})

    const eyes1 = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes1.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes1.close()
    const [result1] = await eyes1.getResults()
    assert.strictEqual(result1.isAborted, true)

    const eyes2 = await Promise.race([
      core.openEyes({
        settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
      }),
      utils.general.sleep(100)!.then(() => assert.fail('not resolved')),
    ])

    await eyes2.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes2.close()
    const [result2] = await eyes2.getResults()
    assert.strictEqual(result2.isAborted, true)
  })

  it('releases concurrency slot if ufg client throw during render', async () => {
    const fakeCore = makeFakeCore()
    const fakeClient = makeFakeClient({
      hooks: {
        async render() {
          throw new Error('render')
        },
      },
    })

    const core = makeCore({concurrency: 1, core: fakeCore as any, client: fakeClient as any})

    const eyes1 = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    await eyes1.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes1.close()

    await assert.rejects(eyes1.getResults(), error => error.message === 'render')

    const eyes2 = await Promise.race([
      core.openEyes({
        settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
      }),
      utils.general.sleep(100)!.then(() => assert.fail('not resolved')),
    ])

    await eyes2.check({target: {cdt: []}, settings: {renderers: [{name: 'chrome', width: 100, height: 100}]}})
    await eyes2.close()

    await assert.rejects(eyes2.getResults(), error => error.message === 'render')
  })

  it('releases concurrency slot when all steps are finished', async () => {
    const fakeCore = makeFakeCore()
    const fakeClient = makeFakeClient()

    const core = makeCore({concurrency: 2, core: fakeCore as any, client: fakeClient as any})

    const eyes = await core.openEyes({
      settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
    })

    const renderers: any[] = [
      {name: 'chrome', width: 100, height: 100},
      {name: 'firefox', width: 100, height: 100},
      {name: 'safari', width: 100, height: 100},
    ]

    await eyes.check({target: {cdt: []}, settings: {renderers}})
    await eyes.check({target: {cdt: []}, settings: {renderers}})

    await eyes.close()
  })
})
