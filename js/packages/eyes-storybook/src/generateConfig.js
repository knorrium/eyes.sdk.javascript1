'use strict';
const pick = require('lodash.pick');
const utils = require('@applitools/utils');
const {resolve} = require('path');
const {deprecationWarning} = require('./errMessages');
const uniq = require('./uniq');
const MAX_DATA_GAP = 60;

function generateConfig({argv = {}, defaultConfig = {}, externalConfigParams = []}) {
  const defaultConfigParams = Object.keys(defaultConfig);
  const configPaths = argv.conf ? [resolve(process.cwd(), argv.conf)] : undefined;
  const configParams = uniq(defaultConfigParams.concat(externalConfigParams));
  const config = utils.config.getConfig({paths: configPaths, params: configParams});
  const argvConfig = pick(argv, configParams);
  const result = Object.assign({}, defaultConfig, config, argvConfig);

  // backward compatibility
  if (result.waitBeforeCapture === defaultConfig.waitBeforeCapture) {
    if (result.waitBeforeScreenshots !== defaultConfig.waitBeforeScreenshots) {
      console.log(
        deprecationWarning({
          deprecatedThing: "'waitBeforeScreenshots'",
          newThing: "'waitBeforeCapture'",
        }),
      );
      result.waitBeforeCapture = result.waitBeforeScreenshots;
    }
    if (result.waitBeforeScreenshot !== defaultConfig.waitBeforeScreenshot) {
      console.log(
        deprecationWarning({
          deprecatedThing: "'waitBeforeScreenshot'",
          newThing: "'waitBeforeCapture'",
        }),
      );
      result.waitBeforeCapture = result.waitBeforeScreenshot;
    }
  }

  if (typeof result.waitBeforeCapture === 'string' && !isNaN(parseInt(result.waitBeforeCapture))) {
    result.waitBeforeCapture = Number(result.waitBeforeCapture);
  }

  if (result.showLogs === '1' || process.env.APPLITOOLS_SHOW_LOGS === 'true') {
    result.showLogs = true;
  }

  result.testConcurrency = utils.types.isInteger(result.testConcurrency)
    ? result.testConcurrency
    : utils.types.isInteger(result.concurrency)
    ? result.concurrency * 5
    : 5;

  result.eyesServerUrl = result.serverUrl;

  result.viewportSize = result.viewportSize ? result.viewportSize : {width: 1024, height: 600};

  result.saveNewTests = result.saveNewTests === undefined ? true : result.saveNewTests;
  result.keepBatchOpen = result.dontCloseBatches;
  result.fully = result.fully === undefined ? true : false;

  if (result.batchName) {
    result.batch = {name: result.batchName, ...result.batch};
  }

  if (result.batchId) {
    result.batch = {id: result.batchId, ...result.batch};
  }

  if (result.storyDataGap === undefined) {
    result.storyDataGap = Math.max(
      Math.min(result.testConcurrency * 2, MAX_DATA_GAP),
      result.testConcurrency,
    );
  }

  transformConfig(result);
  if (!result.renderers) {
    result.renderers = [{name: 'chrome', width: 1024, height: 768}];
  }

  return result;
}

function transformConfig(result) {
  transformLayoutBreakpoints(result);
  transformBrowser(result);
}

function transformBrowser(result) {
  if (result.browser) {
    result.renderers = [];
    if (!Array.isArray(result.browser)) {
      result.browser = [result.browser];
    }
    result.renderers = result.browser.map(browser => {
      if (browser.deviceName) {
        return {chromeEmulationInfo: browser};
      } else if (!browser.name) {
        return {...browser, name: 'chrome'};
      } else {
        return browser;
      }
    });
  }
  delete result.browser;
  return result;
}

function transformLayoutBreakpoints(result) {
  if (
    utils.types.isBoolean(result.layoutBreakpoints) ||
    utils.types.isArray(result.layoutBreakpoints)
  ) {
    result.layoutBreakpoints = {breakpoints: result.layoutBreakpoints};
  }
}

module.exports = {generateConfig, transformConfig};
