const {mergeCypressConfigs} = require('../../../dist/browser/mergeCypressConfigs')
const {describe, it} = require('mocha')
const {expect} = require('chai')
describe('merge cypress configs', () => {
  const shouldDoPostSpecTasks = true,
    testName = 'test open mapping',
    keepBatchOpen = false

  it('should work with config file', () => {
    const args = {}
    const appliConfFile = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      apiKey: 'my api key',
      showLogs: true,
      keepBatchOpen: false,
      testName,
      shouldDoPostSpecTasks,
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilitySettings: {level: 'AAA', version: 'WCAG_2_0'},
      matchLevel: 'Layout',
      enablePatterns: true,
      batch: {id: '1234'},
    }

    const expected = {
      apiKey: 'my api key',
      showLogs: true,
      testName,
      shouldDoPostSpecTasks,
      keepBatchOpen: false,
      enablePatterns: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      matchLevel: 'Layout',
      useDom: true,
      accessibilitySettings: {level: 'AAA', version: 'WCAG_2_0'},
      batch: {id: '1234'},
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
    }
    const coreConfig = mergeCypressConfigs({
      openConfig: args,
      globalConfig: appliConfFile,
    })
    expect(coreConfig).to.eql(expected)
  })
  it('eyes open config should have precedence over config file', () => {
    const args = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      testName,
      shouldDoPostSpecTasks,
      keepBatchOpen,
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilitySettings: {level: 'AAA', version: 'WCAG_2_0'},
      matchLevel: 'Layout',
      enablePatterns: true,
      batch: {id: '12345', name: 'test config file mapping 2', sequenceName: 'S2'},
    }
    const appliConfFile = {
      browser: [
        {width: 1100, height: 800, name: 'chrome'},
        {width: 1400, height: 650, name: 'chrome'},
      ],
      testName: 'name from file',
      useDom: false,
      ignoreCaret: false,
      ignoreDisplacements: false,
      accessibilitySettings: {level: 'AA', version: 'WCAG_2_1'},
      matchLevel: 'Strict',
      enablePatterns: false,
      batch: {id: '1234', name: 'test config file mapping', sequenceName: 'S1'},
    }

    const expected = {
      testName,
      keepBatchOpen,
      shouldDoPostSpecTasks,
      enablePatterns: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      matchLevel: 'Layout',
      useDom: true,
      accessibilitySettings: {level: 'AAA', version: 'WCAG_2_0'},
      batch: {id: '12345', name: 'test config file mapping 2', sequenceName: 'S2'},
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
    }

    const coreConfig = mergeCypressConfigs({
      openConfig: args,
      globalConfig: appliConfFile,
    })
    expect(coreConfig).to.eql(expected)
  })
})
