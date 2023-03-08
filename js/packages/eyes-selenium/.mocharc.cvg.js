const {mochaGrep} = require('@applitools/test-utils')

const tags = [
  'image',
  'headfull',
  'jsonwire',
  'webdriver',
  'mobile',
  'native',
  'native-selectors',
  'chrome',
  'firefox',
  'ie',
  'edge',
  'safari',
  'all-cookies'
]

module.exports = {
  spec: ['./test/generic/*.spec.js'],
  parallel: true,
  jobs: process.env.MOCHA_JOBS || 15,
  timeout: 0,
  reporter: 'mocha-multi',
  reporterOptions: ['spec=-,xunit=coverage-test-report.xml,json=./logs/report.json'],
  require: ['@applitools/test-utils/mocha-hooks/docker.js'],
  grep: mochaGrep({tags}),
}
