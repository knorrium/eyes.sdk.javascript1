const {describe, it, before, after, beforeEach, afterEach} = require('mocha');
const {expect} = require('chai');
const testStorybook = require('../util/testStorybook');
const path = require('path');
const {testServerInProcess} = require('@applitools/test-server');
const eyesStorybook = require('../../src/eyesStorybook');
const generateConfig = require('../../src/generateConfig');
const defaultConfig = require('../../src/defaultConfig');
const {makeTiming} = require('@applitools/monitoring-commons');
const logger = require('../util/testLogger');
const {performance, timeItAsync} = makeTiming();
const {configParams: externalConfigParams} = require('../../src/configParams');
const testStream = require('../util/testStream');

describe('eyesStorybook', () => {
  let closeStorybook, closeTestServer;
  const staticPath = path.resolve(__dirname, '../fixtures/appWithCustomHttpHeaders/');
  const configPath = path.resolve(
    __dirname,
    '../fixtures/appWithCustomHttpHeaders/applitools.config.js',
  );
  before(async () => {
    closeTestServer = (
      await testServerInProcess({port: 7273, staticPath, middlewares: ['httpHeaders']})
    ).close;
    closeStorybook = await testStorybook({port: 9007, storybookConfigDir: staticPath});
  });

  after(async () => {
    await closeTestServer();
    await closeStorybook();
  });

  it('Test puppeteer external headers', async () => {
    const config = generateConfig({argv: {conf: configPath}, defaultConfig, externalConfigParams});
    const {stream} = testStream();

    let results = await eyesStorybook({
      config: {
        ...config,
        browser: [{name: 'chrome', width: 800, height: 600}],
        storybookUrl: 'http://localhost:9007',
        puppeteerExtraHTTPHeaders: {
          token: '12345',
        },
        // puppeteerOptions: {headless: false, devTools: true}
      },
      logger,
      performance,
      timeItAsync,
      outputStream: stream,
    });

    expect(results.summary.matches).to.eq(1);
  });
});
