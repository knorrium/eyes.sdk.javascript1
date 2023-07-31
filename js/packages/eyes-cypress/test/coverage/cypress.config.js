const {defineConfig} = require('cypress')
const group = process.env.MOCHA_GROUP

module.exports = defineConfig({
  reporterEnabled: 'spec, json',
  reporter: 'mocha-multi',
  reporterOptions: {
    spec: '-',
    json: `../../../logs/report${group ? `-${group}` : ''}.json`,
    xunit: 'coverage-test-report.xml',
  },
  chromeWebSecurity: true,
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 86400000,
  eyesIsGlobalHooksSupported: false,
  eyesPort: 51664,
  e2e: {
    setupNodeEvents(_on, _config) {},
    specPattern: '../generic/cypress/e2e/',
  },
})
require('../../types')(module)
