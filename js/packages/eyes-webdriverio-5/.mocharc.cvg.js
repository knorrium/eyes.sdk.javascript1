const {mochaGrep} = require('@applitools/test-utils')

const tags = {
  wd: new Set([
    'image',
    'headfull',
    'webdriver',
    'jsonwire',
    'mobile',
    'native',
    'native-selectors',
    'cached-selectors',
    'chrome',
    'firefox',
    'ie',
    'edge',
    'safari',
    'all-cookies'
  ]),
  cdp: new Set(['image', 'chrome', 'all-cookies', 'cached-selectors'])
}

const protocol = process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL in tags ? process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL : 'wd'

// in wdio version 6 and below there was automatically populated moz argument that blows modern gecodriver
if (Number(process.env.APPLITOOLS_WEBDRIVERIO_VERSION) <= 6) {
  tags[protocol].delete('firefox')
}

module.exports = {
  spec: ['./test/generic/*.spec.js'],
  parallel: true,
  jobs: process.env.MOCHA_JOBS || 15,
  timeout: 0,
  reporter: 'mocha-multi',
  reporterOptions: ['spec=-,xunit=coverage-test-report.xml'],
  grep: mochaGrep({tags: Array.from(tags[protocol])}),
}
