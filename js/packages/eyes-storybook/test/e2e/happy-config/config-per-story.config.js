const path = require('path');

module.exports = {
  appName: 'Config per story',
  batchName: 'Config per story',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/appWithStorybook'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  viewportSize: {width: 900, height: 800},
  testConcurrency: 20,
  ignoreRegions: [{selector: '.global-ignore-this'}],
  storyConfiguration: [
    {
      stories: ({storyTitle}) => storyTitle.includes('them'),
      matchLevel: 'layout',
      target: 'region',
      selector: {selector: '#root > div > div'},
    },
    {
      stories: ({kind}) => kind === 'Button',
      browser: [{name: 'firefox', width: 1024, height: 600}],
    },
    {
      stories: ({kind}) => kind === 'RTL',
      fakeIE: true,
      browser: [{name: 'ie', width: 1024, height: 600}],
    },
  ],
};
