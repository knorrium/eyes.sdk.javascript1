const path = require('path');

module.exports = {
  appName: 'Layout breakpoints',
  batchName: 'Layout breakpoints Layout breakpoints',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/jsLayoutStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [
    {name: 'chrome', width: 1000, height: 800},
    {iosDeviceInfo: {deviceName: 'iPad (7th generation)'}},
    {chromeEmulationInfo: {deviceName: 'Pixel 4 XL'}},
  ],
  storyConfiguration: {
    stories: ({kind}) => kind === 'JS Layout',
    layoutBreakpoints: [500, 1000],
  },
  saveNewTests: false,
  storybookUrl: 'http://localhost:9001',
};
