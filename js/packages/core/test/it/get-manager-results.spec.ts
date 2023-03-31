import type {Core} from '../../src/types'
import {type SpecType} from '@applitools/driver'
import {makeCore} from '../../src/core'
import {generateScreenshot} from '../utils/generate-screenshot'
import {MockDriver, spec} from '@applitools/driver/fake'
import {makeFakeCore} from '../utils/fake-base-core'
import assert from 'assert'

describe('get manager results', async () => {
  let driver: MockDriver, core: Core<SpecType<MockDriver>, 'classic' | 'ufg'>

  before(async () => {
    driver = new MockDriver()
    driver.takeScreenshot = generateScreenshot
    driver.mockElements([
      {selector: 'element0', rect: {x: 1, y: 2, width: 500, height: 501}},
      {selector: 'element1', rect: {x: 10, y: 11, width: 101, height: 102}},
      {selector: 'element2', rect: {x: 20, y: 21, width: 201, height: 202}},
      {selector: 'element3', rect: {x: 30, y: 31, width: 301, height: 302}},
      {selector: 'element4', rect: {x: 40, y: 41, width: 401, height: 402}},
    ])

    const fakeCore = makeFakeCore()
    core = makeCore({spec, base: fakeCore})
  })

  it('should not throw on get results', async () => {
    const manager = await core.makeManager()
    const eyes = await manager.openEyes({target: driver, settings: {appName: 'App', testName: 'Test'}})
    await eyes.check({settings: {name: 'diff'}})
    await eyes.close()
    const summary = await manager.getResults({settings: {throwErr: false}})
    assert.ok(Array.isArray(summary.results))
  })

  it('should throw on get results', async () => {
    const manager = await core.makeManager()
    const eyes = await manager.openEyes({target: driver, settings: {appName: 'App', testName: 'Test'}})
    await eyes.check({settings: {name: 'diff'}})
    await eyes.close()
    await assert.rejects(manager.getResults({settings: {throwErr: true}}))
  })

  it('should return results multiple times', async () => {
    const manager = await core.makeManager()
    const eyes = await manager.openEyes({target: driver, settings: {appName: 'App', testName: 'Test'}})
    await eyes.check()
    await eyes.close()
    const summary1 = await manager.getResults()
    assert.strictEqual(summary1.passed, 1)
    assert.strictEqual(summary1.results[0].result!.status, 'Passed')
    const summary2 = await manager.getResults()
    assert.deepStrictEqual(summary1, summary2)
  })

  it('should remove duplicates', async () => {
    const manager = await core.makeManager()
    let eyes = await manager.openEyes({target: driver, settings: {appName: 'App', testName: 'Test'}})
    await eyes.check({settings: {name: 'blah'}})
    await eyes.close()

    eyes = await manager.openEyes({target: driver, settings: {appName: 'App', testName: 'Test'}})
    await eyes.check({settings: {name: 'blah'}})
    await eyes.close()

    const summary = await manager.getResults({settings: {throwErr: false, removeDuplicateTests: true}})
    assert.deepStrictEqual(summary.results.length, 1)
  })
})
