'use strict';

const {describe, it, before, after} = require('mocha');
const {expect} = require('chai');
const testStorybook = require('../util/testStorybook');
const path = require('path');
const {testServerInProcess} = require('@applitools/test-server');
const eyesStorybook = require('../../src/eyesStorybook');
const {generateConfig} = require('../../src/generateConfig');
const {configParams: externalConfigParams} = require('../../src/configParams');
const {makeTiming} = require('@applitools/monitoring-commons');
const logger = require('../util/testLogger');
const testStream = require('../util/testStream');
const {performance, timeItAsync} = makeTiming();
const {getTestInfo, getTestDom} = require('@applitools/test-utils');

describe('dom-mapping', () => {
  let closeStorybook, closeTestServer;
  before(async () => {
    const server = await testServerInProcess({port: 7272});
    closeTestServer = server.close;
    closeStorybook = await testStorybook({
      port: 9001,
      storybookConfigDir: path.resolve(__dirname, '../fixtures/dom-mapping'),
    });
  });

  after(async () => {
    await closeStorybook();
    await closeTestServer();
  });

  it('works', async () => {
    const {stream} = testStream();
    const configPath = path.resolve(__dirname, 'happy-config/dom-mapping.config.js');
    const defaultConfig = {waitBeforeScreenshots: 50};
    const config = generateConfig({argv: {conf: configPath}, defaultConfig, externalConfigParams});

    let results = await eyesStorybook({
      config: {
        storybookUrl: 'http://localhost:9001',
        browser: [{name: 'chrome', width: 800, height: 600}],
        ...config,
      },
      logger,
      performance,
      timeItAsync,
      outputStream: stream,
    });

    results = results.results.flatMap(r => r.resultsOrErr);
    for (const testResults of results) {
      const session = await getTestInfo(testResults);
      const [actualAppOutput] = session.actualAppOutput;
      const expectedDomMapping = require(path.resolve(
        __dirname,
        '../fixtures/dom-mapping/dom-mapping.json',
      ));
      const actualDomMapping = await getTestDom(
        testResults,
        actualAppOutput.image.domMappingId,
        false,
      );
      expect(actualDomMapping).to.eql(expectedDomMapping);
    }
  });
});
