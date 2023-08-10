const {TestResultsSummary} = require('@applitools/eyes')

function setupEyes({driver, vg, ...config} = {}) {
  const evaluate = driver.evaluate ? driver.evaluate.bind(driver) : driver.executeScript.bind(driver)

  return {
    constructor: {
      async setViewportSize(_driver, size) {
        return evaluate(size => window.__applitools.setViewportSize({size}), size)
      },
    },
    getRunner() {
      return {
        async getAllTestResults(throwErr) {
          const summary = await evaluate(async throwErr => window.__manager.closeManager(throwErr), throwErr)
          return new TestResultsSummary({summary})
        },
      }
    },
    async getViewportSize(_driver) {
      return evaluate(() => window.__applitools.getViewportSize())
    },
    async open(_driver, appName, testName, viewportSize) {
      const configuration = {
        appName,
        testName,
        viewportSize,
        batch: {id: process.env.APPLITOOLS_BATCH_ID, name: process.env.APPLITOOLS_BATCH_NAME || 'JS Coverage Tests'},
        parentBranchName: 'master',
        branchName: 'master',
        dontCloseBatches: true,
        matchTimeout: 0,
        saveNewTests: false,
        ...config,
      }

      if (process.env.APPLITOOLS_API_KEY) {
        configuration.apiKey = process.env.APPLITOOLS_API_KEY
      }

      // Note the implementation here - we are creating a manager explicitly instead of calling window.__applitools.openEyes
      // The reason is to support some coverage tests which need to reference eyes.getRunner(), which maps to window.__manager.
      // This causes another class of issues - if there is page navigation, then we lose the reference to the manager and to eyes.
      // This is exactly what happened in `should waitBeforeCapture in check`.
      // The alternative to use window.__applitools.openEyes was not chosen since it would make the coverage tests that need the manager unsupported.
      // At the time of writing, the core version is 1.2.6, which does create a manager behind the scenes. So there was a thought to expose that implicit manager to the page by emitting `Core.setManager` event.
      // But we will soon upgrade to the latest core, where the call `Core.openEyes` doesn't even utilize a manager, not even behind the scenes.
      return evaluate(
        async ({vg, configuration}) => {
          if (!window.__manager) {
            window.__manager = await window.__applitools.makeManager({
              type: vg ? 'vg' : 'classic',
              concurrency: 10,
            })
          }
          return (window.__eyes = await window.__manager.openEyes({config: configuration}))
        },
        {
          vg,
          configuration,
        },
      )
    },
    async check(settings) {
      return evaluate(settings => window.__eyes.check({settings}), settings)
    },
    async locate(settings) {
      return evaluate(settings => window.__eyes.locate({settings}), settings)
    },
    async extractText(regions) {
      return evaluate(regions => window.__eyes.extractText({regions}), regions)
    },
    async extractTextRegions(settings) {
      return evaluate(settings => window.__eyes.extractTextRegions({settings}), settings)
    },
    async close(throwErr = true) {
      const [result] = await evaluate(throwErr => window.__eyes.close({throwErr}), throwErr)
      return result
    },
    async abort() {
      return evaluate(() => window.__eyes && window.__eyes.abort())
    },
  }
}

module.exports = setupEyes
