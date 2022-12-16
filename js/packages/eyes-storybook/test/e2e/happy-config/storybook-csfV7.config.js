const path = require('path');
if (!process.env.STORYBOOK_VERSION) {
  process.env.STORYBOOK_VERSION = 'latest';
}
module.exports = {
  appName: `Storybook CSF-v7 / ${process.env.STORYBOOK_VERSION}`,
  batchName: `Storybook CSF-v7 / ${process.env.STORYBOOK_VERSION}`,
  storybookConfigDir: path.resolve(__dirname, `../${process.env.STORYBOOK_VERSION}/.storybook`),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [{width: 640, height: 480, name: 'chrome'}],
};
