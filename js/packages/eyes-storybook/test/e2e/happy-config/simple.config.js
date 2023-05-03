const path = require('path');

module.exports = {
  appName: 'Simple per component storybook',
  batchName: 'Simple per component storybook',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/perComponentStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  viewportSize: {width: 900, height: 800},
  browser: {
    width: 800,
    height: 1000,
    name: 'firefox',
  },
};
