import {makeFakeCore} from '../utils/fake-core'
import {strict as assert} from 'assert'
import * as api from '../../src'

describe('Runner', () => {
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
  class ClassicRunner extends api.ClassicRunner {}
  class VisualGridRunner extends api.VisualGridRunner {}

  beforeEach(() => {
    driver = {isDriver: true, viewportSize: {width: 700, height: 500}}
    core?.reset()
  })

  it('should return empty test summary from "getAllTestResults" method if no eyes instances were attached', async () => {
    const runner = new ClassicRunner()
    const summary = await runner.getAllTestResults()
    assert.ok(summary instanceof api.TestResultsSummary)
    assert.equal(Array.from(summary).length, 0)
  })

  it('should return empty test summary from "getAllTestResults" method if only attached eyes instance is disabled', async () => {
    const runner = new VisualGridRunner()
    const eyes = new Eyes(runner, {isDisabled: true})
    await eyes.open(driver)
    await eyes.check()
    eyes.close(false)
    const summary = await runner.getAllTestResults()
    assert.ok(summary instanceof api.TestResultsSummary)
    assert.equal(Array.from(summary).length, 0)
  })
})
