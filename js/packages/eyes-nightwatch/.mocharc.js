const {mochaGrep} = require('@applitools/test-utils')

const tags = [
  'image',
  'headfull',
  'webdriver',
  'emulator',
  'mobile',
  'chrome',
  'firefox',
  'ie',
  'edge',
  'safari',
]
if (Number(process.env.APPLITOOLS_FRAMEWORK_VERSION) <= 1) {
  tags.push('jsonwire')
}
const group = process.env.MOCHA_GROUP

module.exports = {
  timeout: 0,
  require: ['ts-node/register'],
  reporter: 'mocha-multi',
  reporterOptions: [`spec=-,json=./logs/report${group ? `-${group}` : ''}.json,xunit=coverage-test-report.xml`],
  grep: group !== 'it' ? mochaGrep({tags: {allow: tags}}) : undefined,
}
