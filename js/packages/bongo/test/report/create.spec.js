const {createReport} = require('../../src/report/create')
const assert = require('assert')
const {loadFixture, DEFAULTS} = require('./util')
const {convertJunitXmlToResultSchema} = require('../../src/report/xml')

describe('report', () => {
  const {metadata, junit} = DEFAULTS
  describe('create', () => {
    it('should create a report payload without id', () => {
      assert.deepStrictEqual(createReport({name: 'js_selenium_4', metadata, junit}), {
        sdk: 'js_selenium_4',
        group: 'selenium',
        sandbox: false,
        results: [
          {
            test_name: 'test check window with vg',
            parameters: {
              browser: 'chrome',
              mode: 'visualgrid',
              api: undefined,
            },
            passed: false,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test check window with css',
            parameters: {
              browser: 'chrome',
              mode: 'css',
              api: 'classic',
            },
            passed: true,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test check window with scroll',
            parameters: {
              browser: 'chrome',
              mode: 'scroll',
              api: undefined,
            },
            passed: true,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test that was not emitted',
            parameters: {
              browser: 'chrome',
              mode: 'bla',
              api: undefined,
            },
            passed: undefined,
            isSkipped: true,
            isGeneric: true,
          },
          {
            test_name: 'test that was emitted but not executed',
            parameters: {
              browser: 'chrome',
              mode: 'bla',
              api: undefined,
            },
            passed: undefined,
            isSkipped: true,
            isGeneric: true,
          },
        ],
        id: undefined,
      })
    })

    it('should create a report payload with id', () => {
      assert.deepStrictEqual(createReport({reportId: '111111', name: 'js_selenium_4', metadata, junit}), {
        sdk: 'js_selenium_4',
        group: 'selenium',
        sandbox: false,
        results: [
          {
            test_name: 'test check window with vg',
            parameters: {
              browser: 'chrome',
              mode: 'visualgrid',
              api: undefined,
            },
            passed: false,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test check window with css',
            parameters: {
              browser: 'chrome',
              mode: 'css',
              api: 'classic',
            },
            passed: true,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test check window with scroll',
            parameters: {
              browser: 'chrome',
              mode: 'scroll',
              api: undefined,
            },
            passed: true,
            isSkipped: false,
            isGeneric: true,
          },
          {
            test_name: 'test that was not emitted',
            parameters: {
              browser: 'chrome',
              mode: 'bla',
              api: undefined,
            },
            passed: undefined,
            isSkipped: true,
            isGeneric: true,
          },
          {
            test_name: 'test that was emitted but not executed',
            parameters: {
              browser: 'chrome',
              mode: 'bla',
              api: undefined,
            },
            passed: undefined,
            isSkipped: true,
            isGeneric: true,
          },
        ],
        id: '111111',
      })
    })

    it('should create a report with custom coverage tests', () => {
      const junit = loadFixture('multiple-suites-with-custom-tests.xml')
      const result = convertJunitXmlToResultSchema({junit, metadata})
      assert.deepStrictEqual(result, [
        {
          test_name: 'test check window with vg',
          parameters: {
            browser: 'chrome',
            mode: 'visualgrid',
            api: undefined,
          },
          passed: true,
          isSkipped: false,
          isGeneric: true,
        },
        {
          test_name: 'test check window with css',
          parameters: {
            browser: 'chrome',
            mode: 'css',
            api: 'classic',
          },
          passed: true,
          isSkipped: false,
          isGeneric: true,
        },
        {
          test_name: 'test check window with scroll',
          parameters: {
            browser: 'chrome',
            mode: 'scroll',
            api: undefined,
          },
          passed: true,
          isSkipped: false,
          isGeneric: true,
        },
        {
          test_name: 'some custom test',
          parameters: {
            api: undefined,
            browser: 'chrome',
            mode: undefined,
          },
          passed: false,
          isSkipped: false,
          isGeneric: false,
        },
        {
          test_name: 'test that was not emitted',
          parameters: {
            browser: 'chrome',
            mode: 'bla',
            api: undefined,
          },
          passed: undefined,
          isSkipped: true,
          isGeneric: true,
        },
        {
          test_name: 'test that was emitted but not executed',
          parameters: {
            browser: 'chrome',
            mode: 'bla',
            api: undefined,
          },
          passed: undefined,
          isSkipped: true,
          isGeneric: true,
        },
      ])
    })
  })
})
