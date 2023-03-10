const fs = require('fs')
const path = require('path')

const fixtureDir = path.resolve(path.join(__dirname, 'fixtures'))

function loadFixture(fileName) {
  return fs.readFileSync(path.join(fixtureDir, fileName), {
    encoding: 'utf-8',
  })
}

const DEFAULTS = {
  junit: loadFixture('multiple-suites-multiple-tests.xml'),
  metadata: {
    TestCheckWindow: {
      isGeneric: true,
      executionMode: 'css',
      name: 'test check window with css',
      api: 'classic',
    },
    TestCheckWindow_VG: {
      isGeneric: true,
      executionMode: 'visualgrid',
      name: 'test check window with vg',
      skip: true,
    },
    TestCheckWindow_Scroll: {
      isGeneric: true,
      executionMode: 'scroll',
      name: 'test check window with scroll',
      skip: true,
    },
    TestThatWasNotEmitted: {
      isGeneric: true,
      executionMode: 'bla',
      name: 'test that was not emitted',
      skipEmit: true,
    },
    TestThatWasEmittedButNotExecuted: {
      isGeneric: true,
      executionMode: 'bla',
      name: 'test that was emitted but not executed',
    },
  },
}

module.exports = {loadFixture, DEFAULTS, fixtureDir}
