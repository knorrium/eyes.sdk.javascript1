const {mochaGrep} = require('@applitools/test-utils')

const tags = ['image', 'chrome', 'chromium', 'firefox', 'webkit', 'safari', 'all-cookies']

module.exports = {
  spec: ['./test/generic/*.spec.js'],
  parallel: true,
  jobs: 15,
  timeout: 0,
  reporter: 'mocha-multi',
  reporterOptions: ['spec=-,xunit=coverage-test-report.xml'],
  grep: mochaGrep({tags}),
}
