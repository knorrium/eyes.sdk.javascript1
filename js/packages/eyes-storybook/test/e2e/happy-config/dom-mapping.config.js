const path = require('path');

module.exports = {
  appName: 'dom-mapping',
  batchName: 'dom-mapping',
  storybookConfigDir: path.resolve(__dirname, '../../fixtures/dom-mapping'),
  storybookStaticDir: path.resolve(__dirname, '../../fixtures'),
  browser: [{name: 'chrome', width: 1000, height: 800}],
  domMapping: path.resolve(__dirname, '../../fixtures/dom-mapping/dom-mapping.json'),
};
