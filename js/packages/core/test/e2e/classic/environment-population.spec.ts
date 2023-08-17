import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('chrome 107 on window 8', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      url: 'https://hub.browserstack.com/wd/hub',
      capabilities: {
        browserName: 'Chrome',
        browserVersion: '107.0',
        'goog:chromeOptions': {
          args: ['--reduce-user-agent-platform-oscpu'],
        },
        'bstack:options': {
          os: 'Windows',
          osVersion: '8',
          local: 'false',
          seleniumVersion: '3.5.2',
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        },
      },
    })
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('populates environment for browser with reduced user agent', async () => {
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/index.html')
    const core = makeCore({spec})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'test',
        testName: 'test environment',
        environment: {
          viewportSize: {width: 700, height: 460},
        },
      },
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})

describe('chrome 107 on mac os 12', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({
      url: 'https://hub.browserstack.com/wd/hub',
      capabilities: {
        browserName: 'Chrome',
        browserVersion: '107.0',
        'goog:chromeOptions': {
          args: ['--reduce-user-agent-platform-oscpu'],
        },
        'bstack:options': {
          os: 'OS X',
          osVersion: 'Monterey',
          local: 'false',
          seleniumVersion: '3.14.0',
          userName: process.env.BROWSERSTACK_USERNAME,
          accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
        },
      },
    })
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('populates environment for browser with reduced user agent', async () => {
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/FramesTestPage/index.html')
    const core = makeCore({spec})
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'test',
        testName: 'test environment',
        environment: {
          viewportSize: {width: 700, height: 460},
        },
      },
    })
    await eyes.check()
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
