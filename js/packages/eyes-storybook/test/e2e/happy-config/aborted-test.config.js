const path = require('path');

module.exports = {
  appName: 'Aborted test',
  batchName: 'Storybook aborted test',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/singleStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [{width: 640, height: 480, name: 'chrome'}],
};
