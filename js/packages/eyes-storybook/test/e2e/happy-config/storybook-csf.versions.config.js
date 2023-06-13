const path = require('path');
if (!process.env.APPLITOOLS_FRAMEWORK_VERSION) {
  process.env.APPLITOOLS_FRAMEWORK_VERSION = 'latest';
}
module.exports = {
  appName:
    process.env.APPLITOOLS_FRAMEWORK_VERSION === '5.3.21'
      ? `Storybook CSF with versions \ ${process.env.APPLITOOLS_FRAMEWORK_VERSION}/`
      : `Storybook CSF with versions`,
  batchName: `Storybook CSF / ${process.env.APPLITOOLS_FRAMEWORK_VERSION}`,
  storybookConfigDir: path.resolve(
    __dirname,
    `../../fixtures/storybook-versions/${process.env.APPLITOOLS_FRAMEWORK_VERSION}/.storybook`,
  ),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  packagePath: path.resolve(
    __dirname,
    `../../fixtures/storybook-versions/${process.env.APPLITOOLS_FRAMEWORK_VERSION}`,
  ),
  browser: [
    {width: 640, height: 480, name: 'chrome'},
    {width: 1280, height: 960, name: 'chrome'},
  ],
  variations: ({name}) => {
    if (/Them/.test(name)) {
      return [{queryParams: {theme: 'dark'}}];
    }
  },
};
