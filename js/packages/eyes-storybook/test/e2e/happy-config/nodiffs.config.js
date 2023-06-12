const path = require('path');

module.exports = {
  appName: 'dont fail on diffs',
  batchName: 'dont fail on diffs',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/nodiffs'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  viewportSize: {width: 900, height: 800},
  browser: {
    width: 800,
    height: 1000,
  },
  exitcode: 'nodiffs',
  saveNewTests: false,
  testConcurrency: 100, // to avoid the default message in the output. Not that it causes any issue, just cleaner
};
