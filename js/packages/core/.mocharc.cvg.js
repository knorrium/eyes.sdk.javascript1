const {mochaGrep} = require('@applitools/test-utils')

module.exports = {
  spec: ['./test/**/*.spec.ts'],
  exclude: ['./test/bin/**'],
  parallel: true,
  jobs: 15,
  timeout: 0,
  exit: true,
  require: ['ts-node/register'],
  reporter: 'mocha-multi',
  reporterOptions: ['spec=-,xunit=coverage-test-report.xml,json=./logs/report.json'],
  grep: mochaGrep(),
}
