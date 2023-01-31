import {defineConfig} from 'cypress11'
import eyesPlugin from '../../../dist/plugin'

export default eyesPlugin(defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
    },
    specPattern: './**/*.spec.ts',
    video: false,
    screenshotOnRunFailure: false,
  },
}))
