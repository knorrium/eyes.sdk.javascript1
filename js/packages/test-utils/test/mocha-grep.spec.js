const assert = require('assert')
const mochaGrep = require('../src/mocha-grep')

describe('test filter', () => {
  it('works without tags', () => {
    const regexp = mochaGrep({
      tags: {allow: ['headfull', 'webdriver', 'mobile', 'native', 'chrome', 'firefox', 'ie', 'edge', 'safari']},
    })
    assert(regexp.test('no tags'))
  })
  it('works for tests with a single tag', () => {
    const regexp = mochaGrep({
      tags: {allow: ['headfull', 'webdriver', 'mobile', 'native', 'chrome', 'firefox', 'ie', 'edge', 'safari']},
    })
    assert(regexp.test('single tag (@webdriver)'))
  })
  it('works for tests with multiple tags', () => {
    const regexp = mochaGrep({
      tags: {allow: ['headfull', 'webdriver', 'mobile', 'native', 'chrome', 'firefox', 'ie', 'edge', 'safari']},
    })
    assert(regexp.test('multiple tags (@safari @mobile @native)'))
  })
  it('works for tests with multiple tags, but not all tags match', () => {
    const regexp = mochaGrep({
      tags: {allow: ['headfull', 'webdriver', 'mobile', 'native', 'chrome', 'firefox', 'ie', 'edge', 'safari']},
    })
    assert(!regexp.test('not allowed tag (@native-selectors @mobile @native)'))
  })
  it('works for tags in the suite', () => {
    const regexp = mochaGrep({
      tags: {allow: ['headfull', 'webdriver', 'mobile', 'native', 'chrome', 'firefox', 'ie', 'edge', 'safari']},
    })
    assert(regexp.test('suite with tags (@mobile @native) test with no tags'))
  })
  it('works for tags in the suite and in the test', () => {
    const regexp = mochaGrep({
      tags: {allow: ['headfull', 'webdriver', 'mobile', 'native', 'chrome', 'firefox', 'ie', 'edge', 'safari']},
    })
    assert(regexp.test('suite with tags (@mobile @native) test with tags (@safari)'))
  })
})
