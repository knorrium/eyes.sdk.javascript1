'use strict'
const {Eyes, VisualGridRunner} = require('../dist')

module.exports = class EyesOpen {
  async command(appName, testName, viewportSize) {
    const config = (this.client.options && this.client.options.eyes) || {}

    let eyes = this.client.api.globals.__eyes
    if (!eyes) {
      const runner = config.useVisualGrid ? new VisualGridRunner({testConcurrency: config.concurrency}) : undefined
      this.client.api.globals.__eyes = eyes = new Eyes(runner, config)
      if (config.enableEyesLogs) {
        eyes.setLogHandler({type: 'console'})
      }
    }

    await eyes.open(this.client.api, appName, testName, viewportSize)
  }
}
