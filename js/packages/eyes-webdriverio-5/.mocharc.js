const {mochaGrep} = require('@applitools/test-utils')

const tags = {
  wd: new Set([
    'image',
    'headfull',
    'webdriver',
    'jsonwire',
    'emulator',
    'mobile',
    'native',
    'sauce',
    'cached-selectors',
    'chrome',
    'firefox',
    'ie',
    'edge',
    'safari',
    'all-cookies'
  ]),
  cdp: new Set(['image', 'chrome', 'emulator', 'all-cookies', 'cached-selectors'])
}
const protocol = process.env.APPLITOOLS_FRAMEWORK_PROTOCOL in tags ? process.env.APPLITOOLS_FRAMEWORK_PROTOCOL : 'wd'
// in wdio version 6 and below there was automatically populated moz argument that blows modern gecodriver
if (Number(process.env.APPLITOOLS_FRAMEWORK_VERSION) <= 6) {
  tags[protocol].delete('firefox')
}
const group = process.env.MOCHA_GROUP

module.exports = {
  timeout: 0,
  require: ['ts-node/register'],
  reporter: 'mocha-multi',
  reporterOptions: [`spec=-,json=./logs/report${group ? `-${group}` : ''}.json,xunit=coverage-test-report.xml`],
  grep: mochaGrep({tags: {allow: Array.from(tags[protocol])}}),
}
