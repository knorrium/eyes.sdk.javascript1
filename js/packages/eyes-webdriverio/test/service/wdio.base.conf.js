const EyesService = require('../../dist/service')

exports.config = {
  runner: 'local',
  automationProtocol: process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp' ? 'devtools' : 'webdriver',
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {args: ['headless']},
    },
  ],
  logLevel: 'error',
  services: [[EyesService]],
  port: 4444,
  path: '/wd/hub',
  framework: 'mocha',
  reporters: ['dot'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
}
