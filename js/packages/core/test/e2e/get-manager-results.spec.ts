import * as spec from '@applitools/spec-driver-webdriverio'
import {makeCore} from '../../src/index'
import assert from 'assert'

describe('get manager results', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('aborts unclosed tests when getting manager results', async () => {
    const core = makeCore({spec})
    const manager = await core.makeManager()
    const eyes = await manager.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'aborts unclosed tests'},
    })

    await eyes.check({settings: {fully: false}})
    const summary = await manager.getResults()
    assert.ok(summary.results)
    assert.ok(summary.results.length === 1)
    assert.ok(summary.results[0].result?.isAborted)
  })

  it('should throw new test error', async () => {
    const core = makeCore({spec})
    const manager = await core.makeManager()

    await driver.url('https://applitools.com/helloworld')

    const eyes = await manager.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'should set NewTestError to TestResultContainer Exception'},
    })

    await eyes.check({settings: {fully: false}})
    await assert.rejects(manager.getResults({settings: {throwErr: true}}), error => {
      return error.reason === 'test new'
    })
  })

  it('should add new test error to the summary', async () => {
    const core = makeCore({spec})
    const manager = await core.makeManager()

    await driver.url('https://applitools.com/helloworld')

    const eyes = await manager.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'should set NewTestError to TestResultContainer Exception'},
    })

    await eyes.check({settings: {fully: false}})
    const summary = await manager.getResults()
    assert.strictEqual((summary.results[0].error as any).reason, 'test new')
  })

  it('should add internal error to the summary', async () => {
    const core = makeCore({spec})
    const manager = await core.makeManager({type: 'ufg', settings: {concurrency: 5}})

    const eyes = await manager.openEyes({
      target: driver,
      settings: {appName: 'core e2e', testName: 'should add internal error to the summary'},
    })

    await eyes.check({settings: {fully: false, renderers: [{name: 'firefox-3' as 'firefox', width: 640, height: 480}]}})
    const summary = await manager.getResults()
    assert.strictEqual((summary.results[0].error as any).reason, 'internal')
  })
})
