'use strict'
const {describe, it} = require('mocha')
const {expect} = require('chai')
const makeConfig = require('../../../dist/plugin/config').default
const fs = require('fs')
const path = require('path')

describe('config', () => {
  it('should create eyes config', () => {
    const {eyesConfig} = makeConfig()
    expect(eyesConfig).to.deep.equal({
      eyesIsDisabled: false,
      eyesBrowser: undefined,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesDisableBrowserFetching: false,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      eyesRemoveDuplicateTests: false,
      tapDirPath: undefined,
      tapFileName: undefined,
    })
  })

  it('should work with env variables', () => {
    process.env.APPLITOOLS_IS_DISABLED = true
    process.env.APPLITOOLS_BATCH_ID = 'batchId123'
    const {config, eyesConfig} = makeConfig()
    expect(config.batchId).to.equal('batchId123')
    expect(config.isDisabled).to.be.true
    expect(eyesConfig).to.deep.equal({
      eyesIsDisabled: true,
      eyesBrowser: undefined,
      eyesLayoutBreakpoints: undefined,
      eyesFailCypressOnDiff: true,
      eyesDisableBrowserFetching: false,
      eyesTestConcurrency: 5,
      eyesWaitBeforeCapture: undefined,
      eyesRemoveDuplicateTests: false,
      tapDirPath: undefined,
      tapFileName: undefined,
    })
    delete process.env.APPLITOOLS_BATCH_ID
  })

  const filePath = path.join(__dirname, '../../../applitools.config.js')

  afterEach(() => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  })

  it('should convert accessibilityValidation to acceessibilityValidation', () => {
    fs.writeFileSync(filePath, "module.exports = {accessibilityValidation: 'AA'};")
    const {config} = makeConfig()
    expect(config.accessibilitySettings).to.equal('AA')
  })

  it('should create random batch id when batch id is not defined in config file', () => {
    fs.writeFileSync(filePath, 'module.exports = {};')
    const {config} = makeConfig()
    expect(config.batch.id).not.undefined
  })

  it('should not overwrite batch id from config file when passed in an object', () => {
    fs.writeFileSync(filePath, "module.exports = {batch: {id: '1234'}};")
    const {config} = makeConfig()
    expect(config.batch.id).to.equal('1234')
  })

  it('should not overwrite batch id from config file when passed in as a property', () => {
    fs.writeFileSync(filePath, "module.exports = {batchId: '1234'};")
    const {config} = makeConfig()
    expect(config.batch).to.be.undefined
    expect(config.batchId).to.be.equal('1234')
  })

  it('should not overwrite batch name from config file when passed in as an object', () => {
    fs.writeFileSync(filePath, "module.exports = {batch: {name: '1234'}};")
    const {config} = makeConfig()
    expect(config.batch.name).to.be.equal('1234')
  })
})
