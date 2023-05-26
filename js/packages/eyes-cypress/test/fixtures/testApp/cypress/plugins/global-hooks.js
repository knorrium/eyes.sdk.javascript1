/* eslint-disable */
const {testServer} = require('@applitools/test-server');
const {join} = require('path')

module.exports = async (on, config) => {
  on('before:browser:launch', (_browser = {}, launchOptions) => {
      launchOptions.args = launchOptions.args.filter(item => item !== "--disable-dev-shm-usage")
      return launchOptions;
    });
    const staticPath  = config.staticPath || join(__dirname, '../../../../../fixtures')
    const server = await testServer({
      port: config.eyesTestPort || 0,
      staticPath,
      middlewares: config.middlewares,
    });
    return {testPort: server.port};
  
};

require('../../../../../..')(module);