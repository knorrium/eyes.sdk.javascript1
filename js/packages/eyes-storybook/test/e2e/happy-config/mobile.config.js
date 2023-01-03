const path = require('path');

module.exports = {
  appName: 'Simple mobile storybook',
  batchName: 'Simple mobile storybook',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/appWithStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  viewportSize: {width: 900, height: 800},
  browser: {
    width: 800,
    height: 600,
    deviceScaleFactor: 3,
    mobile: true,
    name: 'chrome',
  },
  include: /Button/,
};
