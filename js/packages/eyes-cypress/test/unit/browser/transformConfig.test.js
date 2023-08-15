const {describe, it} = require('mocha')
const {expect} = require('chai')
const {transformCypressConfig} = require('../../../dist/browser/transformCypressConfig')

describe('eyes open mapping', () => {
  const keepBatchOpen = false,
    testName = 'test open mapping'
  it('should work with eyes open config', () => {
    const args = {
      browser: [
        {width: 1200, height: 1000, name: 'chrome'},
        {width: 800, height: 1000, name: 'chrome'},
      ],
      useDom: true,
      ignoreCaret: true,
      ignoreDisplacements: true,
      accessibilityValidation: {level: 'AAA', guidelinesVersion: 'WCAG_2_0'},
      matchLevel: 'Layout',
      enablePatterns: true,
      batch: {id: '1234'},
      shouldDoPostSpecTasks: true,
      testName,
    }

    const expected = {
      open: {
        keepBatchOpen,
        testName,
        batch: {id: '1234'},
        environment: {},
      },
      check: {
        enablePatterns: true,
        ignoreCaret: true,
        ignoreDisplacements: true,
        matchLevel: 'Layout',
        useDom: true,
        renderers: [
          {width: 1200, height: 1000, name: 'chrome'},
          {width: 800, height: 1000, name: 'chrome'},
        ],
        accessibilitySettings: {level: 'AAA', version: 'WCAG_2_0'},
      },
      close: {},
      screenshot: {},
    }
    const coreConfig = removeUndefinedProps(transformCypressConfig(args))
    expect(coreConfig).to.eql(expected)
  })

  it('transform batch correctly', () => {
    const args = {
      batchId: '12345',
      batchName: 'batch name',
      batch: {
        sequenceName: 'some name',
        notifyOnCompletion: true,
        properties: 'Any properties',
      },
    }

    const expected = {
      open: {
        batch: {
          id: '12345',
          name: 'batch name',
          sequenceName: 'some name',
          notifyOnCompletion: true,
          properties: 'Any properties',
        },
        environment: {},
        keepBatchOpen: true,
      },
      check: {},
      close: {},
      screenshot: {},
    }
    const actual = removeUndefinedProps(transformCypressConfig(args))
    expect(actual).to.eql(expected)
  })

  function removeUndefinedProps(obj) {
    for (const [key, value] of Object.entries(obj.open)) {
      if (value === undefined) delete obj.open[key]
    }
    for (const [key, value] of Object.entries(obj.check)) {
      if (value === undefined) delete obj.check[key]
    }
    for (const [key, value] of Object.entries(obj.close)) {
      if (value === undefined) delete obj.close[key]
    }
    for (const [key, value] of Object.entries(obj.screenshot)) {
      if (value === undefined) delete obj.screenshot[key]
    }
    for (const [key, value] of Object.entries(obj.open.batch)) {
      if (value === undefined) delete obj.open.batch[key]
    }
    for (const [key, value] of Object.entries(obj.open.environment)) {
      if (value === undefined) delete obj.open.environment[key]
    }

    return obj
  }
})
