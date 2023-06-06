const path = require('path');

module.exports = {
  appName: `Storybook CSF with errors`,
  batchName: `Storybook CSF with errors / version ${process.env.STORYBOOK_VERSIONS_ERROR_TEST}`,
  storybookConfigDir: path.resolve(
    __dirname,
    `../../fixtures/storybook-with-errors-with-version/${process.env.STORYBOOK_VERSIONS_ERROR_TEST}/.storybook`,
  ),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [{width: 1280, height: 960, name: 'chrome'}],
};
