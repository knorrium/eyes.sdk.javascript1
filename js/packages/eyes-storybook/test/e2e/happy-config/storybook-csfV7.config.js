const path = require('path');
if (!process.env.APPLITOOLS_FRAMEWORK_VERSION) {
  process.env.APPLITOOLS_FRAMEWORK_VERSION = 'latest';
}
module.exports = {
  appName: `Storybook CSF-v7 / ${process.env.APPLITOOLS_FRAMEWORK_VERSION}`,
  batchName: `Storybook CSF-v7 / ${process.env.APPLITOOLS_FRAMEWORK_VERSION}`,
  storybookConfigDir: path.resolve(
    __dirname,
    `../${process.env.APPLITOOLS_FRAMEWORK_VERSION}/.storybook`,
  ),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [{width: 640, height: 480, name: 'chrome'}],
};
