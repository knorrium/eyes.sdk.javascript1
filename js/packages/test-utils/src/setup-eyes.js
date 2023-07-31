const fs = require('fs')
const path = require('path')
const cwd = process.cwd()

const batch = {
  name: process.env.APPLITOOLS_BATCH_NAME || 'JS Coverage Tests',
}

function setupEyes({
  runner,
  vg,
  removeDuplicateTests,
  showLogs,
  saveLogs,
  saveDebugScreenshots,
  sdk = cwd,
  ...config
} = {}) {
  const {Eyes, VisualGridRunner, ClassicRunner} = require(require.resolve(path.join(sdk, './dist'), {paths: [cwd]}))
  runner =
    runner ||
    (vg
      ? new VisualGridRunner({testConcurrency: 500, removeDuplicateTests})
      : new ClassicRunner({removeDuplicateTests}))
  const configuration = {
    batch,
    parentBranchName: 'master',
    branchName: 'master',
    dontCloseBatches: true,
    matchTimeout: 0,
    saveNewTests: false,
    ...config,
  }

  if (process.env.APPLITOOLS_SAVE_DEBUG_SCREENSHOTS || saveDebugScreenshots) {
    const debugScreenshotsPath = path.resolve(
      cwd,
      typeof saveDebugScreenshots === 'string' ? saveDebugScreenshots : `./logs/${new Date().toISOString()}`,
    )
    fs.mkdirSync(debugScreenshotsPath, {recursive: true})
    configuration.debugScreenshots = {
      save: true,
      path: debugScreenshotsPath,
    }
  }

  const eyes = new Eyes(runner)
  eyes.setConfiguration(configuration)

  if (process.env.APPLITOOLS_SHOW_LOGS || showLogs) {
    eyes.setLogHandler({type: 'console'})
  } else if (process.env.APPLITOOLS_SAVE_LOGS || saveLogs) {
    const logsPath = path.resolve(
      cwd,
      typeof saveLogs === 'string' ? saveLogs : `./logs/${new Date().toISOString()}.log`,
    )
    eyes.setLogHandler({type: 'file', filename: logsPath})
  }

  return eyes
}

module.exports = setupEyes
