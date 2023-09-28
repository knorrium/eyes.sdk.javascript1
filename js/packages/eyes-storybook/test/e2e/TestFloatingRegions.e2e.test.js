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
const snap = require('@applitools/snaptdout');
const {getTestInfo} = require('@applitools/test-utils');

describe('eyes-storybook floating region', () => {
  let closeStorybook, closeTestServer;
  before(async () => {
    const server = await testServerInProcess({port: 7272});
    closeTestServer = server.close;
    closeStorybook = await testStorybook({
      port: 9001,
      storybookConfigDir: path.resolve(__dirname, '../fixtures/floatingRegionStorybook'),
    });
  });

  after(async () => {
    await closeStorybook();
    await closeTestServer();
  });

  it('renders storybook with floating region', async () => {
    const {stream, getEvents} = testStream();
    const configPath = path.resolve(__dirname, 'happy-config/floatingRegion.config.js');
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

    const expectedTitles = [
      'Single category: Story with local floating region by selector',
      'Single category: Story with local floating region by coordinates',
    ];
    expect(results.results.map(e => e.title).sort()).to.eql(expectedTitles.sort());
    results = results.results.flatMap(r => r.resultsOrErr);
    expect(results.some(x => x instanceof Error)).to.be.false;
    expect(results).to.have.length(2);

    const [actualAppOutput] = await getSession(results[0]);
    const [actualAppOutput2] = await getSession(results[1]);
    const expected = [
      [
        {
          maxLeftOffset: 20,
          maxRightOffset: 20,
          maxUpOffset: 0,
          maxDownOffset: 40,
          left: 36,
          top: 16,
          width: 260,
          height: 260,
        },
      ],
      [
        {
          maxLeftOffset: 20,
          maxRightOffset: 20,
          maxUpOffset: 0,
          maxDownOffset: 40,
          left: 36,
          top: 16,
          width: 260,
          height: 260,
          regionId: '.floating-region',
        },
      ],
    ];
    expect([
      actualAppOutput.imageMatchSettings.floating,
      actualAppOutput2.imageMatchSettings.floating,
    ]).to.have.deep.members(expected);
    await snap(getEvents().join(''), 'floating validation');
  });
});

async function getSession(result) {
  const session = await getTestInfo(result);
  return session.actualAppOutput;
}
