/* global browser */
'use strict'
const {getTestInfo} = require('@applitools/test-utils')
const {version} = require('../../../package.json')
const {strictEqual} = require('assert')

describe('vg', () => {
  it('full page', async () => {
    await browser.url('http://applitools.github.io/demo/TestPages/FramesTestPage/')
    await browser.eyesCheck('full page')
  })
  after(async () => {
    const testResults = await browser.eyesGetTestResults()
    const data = await getTestInfo(testResults, process.env.APPLITOOLS_API_KEY)
    strictEqual(data.startInfo.agentId, `eyes-webdriverio-service.visualgrid/${version}`)
  })
})
