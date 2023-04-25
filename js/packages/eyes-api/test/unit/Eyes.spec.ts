import {makeFakeCore} from '../utils/fake-core'
import {strict as assert} from 'assert'
import * as api from '../../src'

describe('Eyes', () => {
  let driver: any
  let core: {history: any[]; reset: () => void}
  class Eyes extends api.Eyes {
    protected static _sdk = {
      makeCore() {
        return (core = makeFakeCore())
      },
      spec: {
        isDriver(driver: any) {
          return Boolean(driver.isDriver)
        },
      } as any,
    }
  }

  beforeEach(() => {
    driver = {isDriver: true, viewportSize: {width: 700, height: 500}}
    core?.reset()
  })

  it('should create classic eyes by default', async () => {
    const eyes = new Eyes()
    assert.ok(eyes.runner instanceof api.ClassicRunner)
    await eyes.open(driver)
    assert.deepEqual(
      core.history.filter(h => h.command === 'makeManager'),
      [{command: 'makeManager', data: {type: 'classic', settings: {}}}],
    )
  })

  it('should create ufg eyes with concurrency', async () => {
    const eyes = new Eyes(new api.VisualGridRunner({testConcurrency: 7}))
    assert.ok(eyes.runner instanceof api.VisualGridRunner)
    await eyes.open(driver)
    assert.deepEqual(
      core.history.filter(h => h.command === 'makeManager'),
      [
        {
          command: 'makeManager',
          data: {type: 'ufg', settings: {concurrency: 7, legacyConcurrency: undefined, fetchConcurrency: undefined}},
        },
      ],
    )
  })

  it('should create ufg eyes with legacy concurrency', async () => {
    const eyes = new Eyes(new api.VisualGridRunner(7))
    assert.ok(eyes.runner instanceof api.VisualGridRunner)
    await eyes.open(driver)
    assert.deepEqual(
      core.history.filter(h => h.command === 'makeManager'),
      [
        {
          command: 'makeManager',
          data: {type: 'ufg', settings: {concurrency: undefined, legacyConcurrency: 7, fetchConcurrency: undefined}},
        },
      ],
    )
  })

  it('should create classic eyes with removeDuplicateTests', async () => {
    const eyes = new Eyes(new api.ClassicRunner({removeDuplicateTests: true}))
    assert.ok(eyes.runner instanceof api.ClassicRunner)
    await eyes.open(driver)
    await eyes.check()
    await eyes.close()
    await eyes.runner.getAllTestResults()
    assert.deepEqual(
      core.history.filter(h => h.command === 'getManagerResults'),
      [{command: 'getManagerResults', data: {settings: {throwErr: true, removeDuplicateTests: true}}}],
    )
  })

  it('should create vg eyes with removeDuplicateTests', async () => {
    const eyes = new Eyes(new api.VisualGridRunner({removeDuplicateTests: true}))
    assert.ok(eyes.runner instanceof api.VisualGridRunner)
    await eyes.open(driver)
    await eyes.check()
    await eyes.close()
    await eyes.runner.getAllTestResults()
    assert.deepEqual(
      core.history.filter(h => h.command === 'getManagerResults'),
      [{command: 'getManagerResults', data: {settings: {throwErr: true, removeDuplicateTests: true}}}],
    )
  })

  it('should merge configuration from eyes instance and "open" method', async () => {
    const config = {
      appName: 'base-app',
      displayName: 'name',
      branchName: 'branch',
      baselineBranchName: 'baseline',
      apiKey: 'apikey',
    }
    const eyes = new Eyes({apiKey: config.apiKey})
    eyes.getConfiguration().setDisplayName(config.displayName)
    eyes.setBranchName(config.branchName)
    eyes.configuration.baselineBranchName = config.baselineBranchName

    const openConfig = {
      appName: 'app',
      testName: 'test',
      batch: {id: 'batch-id'},
    }
    await eyes.open(driver, openConfig)

    assert.deepEqual(
      core.history.filter(h => h.command === 'openEyes'),
      [
        {
          command: 'openEyes',
          data: {
            target: driver,
            config: {
              open: {...config, ...openConfig, environment: {}, keepPlatformNameAsIs: true},
              screenshot: {normalization: {}},
              check: {},
              close: {},
            },
          },
        },
      ],
    )
  })

  it('should override configuration from eyes instance using "open" method arguments', async () => {
    const config = <const>{
      appName: 'app',
      testName: 'test',
      displayName: 'name',
      environment: {viewportSize: {width: 600, height: 700}},
      sessionType: 'SEQUENTIAL',
      apiKey: 'apikey',
    }
    const eyes = new Eyes(config)

    const openConfig = <const>{
      appName: 'app-o',
      testName: 'test-o',
      environment: {viewportSize: {width: 300, height: 400}},
      sessionType: 'PROGRESSION',
    }
    await eyes.open(
      driver,
      openConfig.appName,
      openConfig.testName,
      openConfig.environment.viewportSize,
      openConfig.sessionType,
    )
    assert.deepEqual(
      core.history.filter(h => h.command === 'openEyes'),
      [
        {
          command: 'openEyes',
          data: {
            target: driver,
            config: {
              open: {...config, ...openConfig, keepPlatformNameAsIs: true},
              screenshot: {normalization: {}},
              check: {},
              close: {},
            },
          },
        },
      ],
    )
  })

  it('should return driver from "open" method if eyes instance is disabled', async () => {
    const eyes = new Eyes()
    eyes.setIsDisabled(true)
    assert.deepEqual(eyes.driver, undefined)
    const actualDriver = await eyes.open(driver)
    assert.deepEqual(actualDriver, driver)
    assert.deepEqual(eyes.driver, driver)
    assert.deepEqual(eyes.getDriver(), driver)
    assert.ok(core.history.every(h => h.command !== 'open'))
  })

  it('should return driver from "open" method', async () => {
    const eyes = new Eyes()
    assert.deepEqual(eyes.driver, undefined)
    const actualDriver = await eyes.open(driver)
    assert.deepEqual(actualDriver, driver)
    assert.deepEqual(eyes.driver, driver)
    assert.deepEqual(eyes.getDriver(), driver)
  })

  it('should return null from "check" method if eyes instance is disabled', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    eyes.setIsDisabled(true)
    const actualResult = await eyes.check()
    assert.equal(actualResult, null)
    assert.ok(core.history.every(h => h.command !== 'check'))
  })

  it('should throw from "check" method if it was called before "open" method', async () => {
    const eyes = new Eyes()
    await assert.rejects(eyes.check(), new api.EyesError('Eyes not open'))
  })

  it('should return match result "check" method', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    const actualResult = await eyes.check()
    assert.ok(actualResult instanceof api.MatchResult)
  })

  it('should return null from "close" method if eyes instance is disabled', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    await eyes.check()
    eyes.setIsDisabled(true)
    const actualResult = await eyes.close()
    assert.equal(actualResult, null)
    assert.ok(core.history.every(h => h.command !== 'close'))
  })

  it('should return test results from "close" method', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    const actualResult = await eyes.close()
    assert.ok(actualResult instanceof api.TestResults)
  })

  it('should return test results from "close" method even without checks', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    await eyes.check()
    const actualResult = await eyes.close()
    assert.ok(actualResult instanceof api.TestResults)
  })

  it('should throw from "close" method if it was called before "open" method', async () => {
    const eyes = new Eyes()
    await assert.rejects(eyes.close(), new api.EyesError('Eyes not open'))
  })

  it('should throw from "close" method if test failed and "throw error" flag on', async () => {
    const eyes = new Eyes()
    await eyes.open(driver, {appName: 'app', testName: 'test'})
    await eyes.check({region: 'diff'})
    await assert.rejects(eyes.close(true), err => {
      return err instanceof api.TestFailedError
    })
  })

  it('should not throw from "close" method if test failed and "throw error" flag off', async () => {
    const eyes = new Eyes()
    await eyes.open(driver, {appName: 'app', testName: 'test'})
    await eyes.check({region: 'diff'})
    const actualResult = await eyes.close(false)
    assert.equal(actualResult.status, 'Unresolved')
  })

  it('should return null from "abort" method if eyes instance is disabled', async () => {
    const eyes = new Eyes()
    eyes.setIsDisabled(true)
    await eyes.open(driver, {appName: 'app', testName: 'test'})
    await eyes.check({region: 'diff'})
    const actualResult = await eyes.abort()
    assert.equal(actualResult, null)
  })

  it('should return null from "abort" method if it was called before "open" method', async () => {
    const eyes = new Eyes()
    const actualResult = await eyes.abort()
    assert.equal(actualResult, null)
  })

  it('should set viewport size with static method', async () => {
    const viewportSize = {width: 100, height: 101}
    await Eyes.setViewportSize(driver, viewportSize)
    const viewportSizeData = new api.RectangleSize(200, 201)
    await Eyes.setViewportSize(driver, viewportSizeData)

    assert.deepEqual(
      core.history.filter(h => h.command === 'setViewportSize'),
      [
        {command: 'setViewportSize', data: [driver, viewportSize]},
        {command: 'setViewportSize', data: [driver, viewportSizeData]},
      ],
    )
  })

  it('should set viewport size with instance method in configuration before open', async () => {
    const eyes = new Eyes()
    const viewportSize = {width: 100, height: 101}
    await eyes.setViewportSize(viewportSize)
    assert.deepEqual(eyes.configuration.viewportSize, viewportSize)
    const viewportSizeData = new api.RectangleSize(200, 201)
    await eyes.setViewportSize(viewportSizeData)
    assert.deepEqual(eyes.configuration.viewportSize, viewportSizeData)
  })

  it('should set viewport size with instance method after open', async () => {
    const eyes = new Eyes()
    await eyes.open(driver)
    const viewportSize = {width: 100, height: 101}
    await eyes.setViewportSize(viewportSize)
    assert.deepEqual(eyes.configuration.viewportSize, viewportSize)
    const viewportSizeData = new api.RectangleSize(200, 201)
    await eyes.setViewportSize(viewportSizeData)
    assert.deepEqual(eyes.configuration.viewportSize, viewportSizeData)

    assert.deepEqual(
      core.history.filter(h => h.command === 'setViewportSize'),
      [
        {command: 'setViewportSize', data: [driver, viewportSize]},
        {command: 'setViewportSize', data: [driver, viewportSizeData]},
      ],
    )
  })

  it('should get viewport size even if it was not set after open', async () => {
    const eyes = new Eyes()

    await eyes.open(driver)
    const actualViewportSize = await eyes.getViewportSize()
    assert.deepEqual(actualViewportSize.toObject(), driver.viewportSize)

    assert.deepEqual(
      core.history.filter(h => h.command === 'getViewportSize'),
      [{command: 'getViewportSize', data: [driver], result: driver.viewportSize}],
    )
  })
})
