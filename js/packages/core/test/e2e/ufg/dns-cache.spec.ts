import {makeCore} from '../../../src/ufg/core'
import * as spec from '@applitools/spec-driver-puppeteer'
import assert from 'assert'

// Example batch:
// https://eyes.applitools.com/app/test-results/00000251714318933724/?accountId=xIpd7EWjhU6cjJzDGrMcUw~~

describe('DNS cache', () => {
  let page: spec.Driver, destroyPage: () => Promise<void>

  before(async () => {
    ;[page, destroyPage] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyPage?.()
  })

  it('completes UFG test with useDnsCache', async () => {
    await page.goto('https://applitools.github.io/demo/TestPages/FramesTestPage/index.html')

    const core = makeCore({spec, concurrency: 10})

    const eyes = await core.openEyes({
      target: page,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core e2e',
        testName: 'DNS cache',
        useDnsCache: true,
      },
    })
    await eyes.check({settings: {renderers: [{name: 'chrome', width: 800, height: 600}], disableBrowserFetching: true}})
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()

    assert.strictEqual(result.status, 'Passed')
  })
})
