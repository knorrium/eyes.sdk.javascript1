const {sendTestReport} = require('../../src/qa/send-report')
const path = require('path')
const assert = require('assert')
const nock = require('nock')

describe('report', () => {
  const fixtureDir = path.resolve(__dirname, '../fixtures')
  const resultPath = path.resolve(fixtureDir, 'multiple-suites-multiple-tests.xml')
  const metaPath = path.resolve(fixtureDir, 'metadata.json')

  it('should create a report payload without id', async () => {
    nock('http://applitools-quality-server.herokuapp.com')
      .post('/result')
      .matchHeader('Content-Type', 'application/json')
      .reply((_uri, body) => {
        assert.deepStrictEqual(body, {
          sdk: 'js_selenium_4',
          group: 'selenium',
          sandbox: false,
          results: [
            {
              test_name: 'test check window with vg',
              parameters: {variant: 'vg'},
              passed: false,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'test check window with css',
              parameters: {variant: 'css'},
              passed: true,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'test check window with scroll',
              parameters: {},
              passed: true,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'test that was not emitted',
              parameters: {},
              isSkipped: true,
              isGeneric: true,
            },
            {
              test_name: 'test that was emitted but not executed',
              parameters: {},
              isSkipped: true,
              isGeneric: true,
            },
          ],
        })
        return [200]
      })

    await sendTestReport({name: 'js_selenium_4', resultPath, metaPath})
  })

  it('should create a report payload with id', async () => {
    nock('http://applitools-quality-server.herokuapp.com')
      .post('/result')
      .matchHeader('Content-Type', 'application/json')
      .reply((_uri, body) => {
        assert.deepStrictEqual(body, {
          id: '1111',
          sdk: 'js_selenium_4',
          group: 'selenium',
          sandbox: false,
          results: [
            {
              test_name: 'test check window with vg',
              parameters: {variant: 'vg'},
              passed: false,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'test check window with css',
              parameters: {variant: 'css'},
              passed: true,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'test check window with scroll',
              parameters: {},
              passed: true,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'test that was not emitted',
              parameters: {},
              isSkipped: true,
              isGeneric: true,
            },
            {
              test_name: 'test that was emitted but not executed',
              parameters: {},
              isSkipped: true,
              isGeneric: true,
            },
          ],
        })
        return [200]
      })

    await sendTestReport({reportId: '1111', name: 'js_selenium_4', resultPath, metaPath})
  })

  it('should create a report with custom coverage tests', async () => {
    nock('http://applitools-quality-server.herokuapp.com')
      .post('/result')
      .matchHeader('Content-Type', 'application/json')
      .reply((_uri, body) => {
        assert.deepStrictEqual(body, {
          sdk: 'js_selenium_4',
          group: 'selenium',
          sandbox: false,
          results: [
            {
              test_name: 'test check window with vg',
              parameters: {variant: 'vg'},
              passed: true,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'test check window with css',
              parameters: {variant: 'css'},
              passed: true,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'test check window with scroll',
              parameters: {},
              passed: true,
              isSkipped: false,
              isGeneric: true,
            },
            {
              test_name: 'some custom test',
              parameters: {},
              passed: false,
              isSkipped: false,
              isGeneric: false,
            },
            {
              test_name: 'test that was not emitted',
              parameters: {},
              isSkipped: true,
              isGeneric: true,
            },
            {
              test_name: 'test that was emitted but not executed',
              parameters: {},
              isSkipped: true,
              isGeneric: true,
            },
          ],
        })
        return [200]
      })

    await sendTestReport({
      name: 'js_selenium_4',
      resultPath: path.resolve(fixtureDir, 'multiple-suites-with-custom-tests.xml'),
      metaPath,
    })
  })

  it('should create a report from raw file', async () => {
    nock('http://applitools-quality-server.herokuapp.com')
      .post('/result')
      .matchHeader('Content-Type', 'application/json')
      .reply((_uri, body) => {
        assert.deepStrictEqual(body, {
          group: 'selenium',
          id: 'report-id',
          sdk: 'java',
          results: [
            {passed: true, parameters: {}, test_name: 'testDefaultPadding'},
            {passed: true, parameters: {}, test_name: 'testPaddingAllDirections'},
            {passed: true, parameters: {}, test_name: 'testPaddingWhenAssigned'},
          ],
          sandbox: true,
        })
        return [200]
      })

    await sendTestReport({
      reportId: 'report-id',
      resultFormat: 'raw',
      resultPath: path.resolve(fixtureDir, 'raw-report.json'),
    })
  })
})
