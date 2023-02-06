/* global browser */
'use strict'
const {Target} = require('../../../dist')
const {getTestInfo} = require('@applitools/test-utils')
const {version} = require('../../../package.json')
const {strictEqual} = require('assert')

describe('EyesServiceTest', () => {
  it('checkWindow', async () => {
    await browser.url('https://applitools.github.io/demo/TestPages/FramesTestPage/index.html')
    await browser.eyesCheck('', Target.window())
    const testResults = await browser.eyesGetTestResults()
    const data = await getTestInfo(testResults, process.env.APPLITOOLS_API_KEY)
    strictEqual(data.startInfo.agentId, `eyes-webdriverio-service/${version}`)
  })
})
