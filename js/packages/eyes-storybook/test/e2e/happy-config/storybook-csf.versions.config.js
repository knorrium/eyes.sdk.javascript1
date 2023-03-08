const path = require('path');
if (!process.env.STORYBOOK_VERSION) {
  process.env.STORYBOOK_VERSION = 'latest';
}
module.exports = {
  appName:
    process.env.STORYBOOK_VERSION === '5.3.21'
      ? `Storybook CSF with versions \ ${process.env.STORYBOOK_VERSION}/`
      : `Storybook CSF with versions`,
  batchName: `Storybook CSF / ${process.env.STORYBOOK_VERSION}`,
  storybookConfigDir: path.resolve(
    __dirname,
    `../../fixtures/storybook-versions/${process.env.STORYBOOK_VERSION}/.storybook`,
  ),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  packagePath: path.resolve(
    __dirname,
    `../../fixtures/storybook-versions/${process.env.STORYBOOK_VERSION}`,
  ),
  browser: [
    {width: 640, height: 480, name: 'chrome'},
    {width: 1280, height: 960, name: 'chrome'},
  ],
};
