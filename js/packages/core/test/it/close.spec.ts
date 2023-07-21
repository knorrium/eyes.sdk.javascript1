import type {Core} from '../../src/types'
import {type SpecType} from '@applitools/driver'
import {makeCore} from '../../src/core'
import {generateScreenshot} from '../utils/generate-screenshot'
import {MockDriver, spec} from '@applitools/driver/fake'
import {makeFakeCore} from '../utils/fake-base-core'

describe('get results', async () => {
  let driver: MockDriver, core: Core<SpecType<MockDriver>, 'classic' | 'ufg'>

  async function destroyDriver(driver: MockDriver) {
    driver.wrapMethod('executeScript', async () => {
      throw new Error('The driver is destroyed')
    })
  }

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

  it('should not throw if driver is destroyed before close', async () => {
    const eyes = await core.openEyes({target: driver, settings: {appName: 'App', testName: 'Test'}})
    await eyes.check()
    await destroyDriver(driver)
    await eyes.close()
  })
})
