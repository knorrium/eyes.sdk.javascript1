const {defineConfig} = require('cypress');
const eyesPlugin = require('../../../../')

module.exports = eyesPlugin(defineConfig({
  chromeWebSecurity: true,
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 86400000,
  eyesIsGlobalHooksSupported: false,
  eyesPort: 51664,
  e2e: {
    setupNodeEvents(on, config) {
    },
    specPattern: './cypress/integration-run',
    supportFile: './cypress/support/e2e.js',
  },
}));
