const webpackConfig = require('./webpack.config.js');

module.exports = {
  video: false,

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: webpackConfig,
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};
require('../../')(module);
