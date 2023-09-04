'use strict';
const {describe, it, beforeEach} = require('mocha');
const {expect} = require('chai');
const makeRenderStory = require('../../src/renderStory');
const {presult} = require('@applitools/functional-commons');
const {makeTiming} = require('@applitools/monitoring-commons');
const psetTimeout = require('util').promisify(setTimeout);
const getStoryTitle = require('../../src/getStoryTitle');
const getStoryBaselineName = require('../../src/getStoryBaselineName');
const logger = require('../util/testLogger');
const makeGetStoriesWithConfig = require('../../src/getStoriesWithConfig');

describe('renderStory', () => {
  let performance, timeItAsync;
  const defaultSettings = {
    storyDataGap: 10,
    appName: 'app name',
    closeSettings: {},
  };

  beforeEach(() => {
    const timing = makeTiming();
    performance = timing.performance;
    timeItAsync = timing.timeItAsync;
  });

  it('passes correct parameters to openEyes and checkAndClose - basic', async () => {
    const openEyes = async openParams => {
      const result = {openParams};
      return {
        checkAndClose: async checkParams => (result.checkParams = checkParams),
        getResults: async () => result,
      };
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      performance,
      timeItAsync,
      openEyes,
    });

    const baseStory = {
      name: 'name',
      kind: 'kind',
    };
    const baselineName = getStoryBaselineName(baseStory);
    const title = getStoryTitle(baseStory);
    const story = {
      ...baseStory,
      storyTitle: title,
      baselineName,
      config: {
        renderers: [{name: 'chrome', width: 800, height: 600}],
      },
    };

    const results = await renderStory({
      story,
      snapshots: 'snapshot',
      url: 'url',
    });

    deleteUndefinedPropsRecursive(results);
    const expected = {
      openParams: {
        settings: {
          appName: 'app name',
          properties: [
            {
              name: 'Component name',
              value: 'kind',
            },
            {
              name: 'State',
              value: 'name',
            },
          ],
          testName: baselineName,
          displayName: title,
        },
      },
      checkParams: {
        settings: {
          renderers: [{name: 'chrome', width: 800, height: 600}],
          url: 'url',
        },
        target: 'snapshot',
      },
    };
    expect(results).to.eql(expected);
  });

  it('passes correct parameters to openEyes and checkAndClose - local configuration', async () => {
    const getStoriesWithConfig = makeGetStoriesWithConfig({config: {}});
    const openEyes = async openParams => {
      const result = {openParams};
      return {
        checkAndClose: async checkParams => (result.checkParams = checkParams),
        getResults: async () => result,
      };
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      openEyes,
      performance,
      timeItAsync,
    });

    const eyesOptions = {
      ignoreRegions: 'ignore',
      floatingRegions: [{selector: '.floating-region'}],
      accessibilityRegions: [{selector: '.accessibility-region'}],
      strictRegions: 'strict',
      layoutRegions: 'layout',
      contentRegions: 'content',
      scriptHooks: 'scriptHooks',
      sizeMode: 'sizeMode',
      target: 'region',
      fully: 'fully',
      selector: 'selector',
      tag: 'tag',
      ignoreDisplacements: 'ignoreDisplacements',
      properties: [{name: 'Custom property', value: null}],
      sendDom: 'sendDom',
      visualGridOptions: 'visualGridOptions',
      useDom: 'useDom',
      enablePatterns: 'enablePatterns',
    };

    const baseStory = {
      name: 'name',
      kind: 'kind',
      parameters: {eyes: eyesOptions},
    };
    const title = getStoryTitle(baseStory);
    const baselineName = getStoryBaselineName(baseStory);
    const storiesWithConfig = await getStoriesWithConfig({stories: [baseStory]});
    const results = await renderStory({story: storiesWithConfig.stories[0], snapshots: 'snapshot'});
    deleteUndefinedPropsRecursive(results);

    const {properties} = eyesOptions;
    const expected = {
      openParams: {
        settings: {
          appName: 'app name',
          properties: [
            {
              name: 'Component name',
              value: 'kind',
            },
            {
              name: 'State',
              value: 'name',
            },
            ...properties,
          ],
          testName: baselineName,
          displayName: title,
        },
      },
      checkParams: {
        target: 'snapshot',
        settings: {
          ignoreRegions: 'ignore',
          floatingRegions: [
            {region: '.floating-region', offset: {bottom: 0, top: 0, left: 0, right: 0}},
          ],
          accessibilityRegions: [{region: '.accessibility-region'}],
          strictRegions: 'strict',
          layoutRegions: 'layout',
          contentRegions: 'content',
          hooks: 'scriptHooks',
          sizeMode: 'sizeMode',
          fully: 'fully',
          region: 'selector',
          tag: 'tag',
          sendDom: 'sendDom',
          ufgOptions: 'visualGridOptions',
          useDom: 'useDom',
          enablePatterns: 'enablePatterns',
          ignoreDisplacements: 'ignoreDisplacements',
        },
      },
    };
    expect(results).to.eql(expected);
  });

  it('passes correct parameters to openEyes and checkAndClose - global configuration', async () => {
    const openEyes = async openParams => {
      const result = {openParams};
      return {
        checkAndClose: async checkParams => (result.checkParams = checkParams),
        getResults: async () => result,
      };
    };

    const globalConfig = {
      ignoreRegions: 'ignore',
      floatingRegions: [{selector: '.floating-region', maxDownOffset: 10, maxLeftOffset: 10}],
      accessibilityRegions: [{selector: '.accessibility-region'}],
      strictRegions: 'strict',
      layoutRegions: 'layout',
      contentRegions: 'content',
      scriptHooks: 'scriptHooks',
      sizeMode: 'sizeMode',
      target: 'region',
      fully: 'fully',
      selector: 'selector',
      tag: 'tag',
      sendDom: 'sendDom',
      visualGridOptions: 'visualGridOptions',
      useDom: 'useDom',
      enablePatterns: 'enablePatterns',
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      openEyes,
      performance,
      timeItAsync,
    });

    const baseStory = {name: 'name', kind: 'kind'};
    const baselineName = getStoryBaselineName(baseStory);
    const title = getStoryTitle(baseStory);
    const story = {...baseStory, storyTitle: title, baselineName, config: globalConfig};

    const results = await renderStory({story, snapshots: 'snapshot'});

    deleteUndefinedPropsRecursive(results);
    const expected = {
      openParams: {
        settings: {
          appName: 'app name',
          properties: [
            {
              name: 'Component name',
              value: 'kind',
            },
            {
              name: 'State',
              value: 'name',
            },
          ],
          testName: baselineName,
          displayName: title,
        },
      },
      checkParams: {
        target: 'snapshot',
        settings: {
          ignoreRegions: 'ignore',
          floatingRegions: [
            {region: '.floating-region', offset: {bottom: 10, top: 0, left: 10, right: 0}},
          ],
          accessibilityRegions: [{region: '.accessibility-region'}],
          strictRegions: 'strict',
          layoutRegions: 'layout',
          contentRegions: 'content',
          hooks: 'scriptHooks',
          sizeMode: 'sizeMode',
          fully: 'fully',
          region: 'selector',
          tag: 'tag',
          sendDom: 'sendDom',
          ufgOptions: 'visualGridOptions',
          useDom: 'useDom',
          enablePatterns: 'enablePatterns',
        },
      },
    };
    expect(results).to.eql(expected);
  });

  it('passes correct parameters to openEyes and checkAndClose - local configuration overrides global configuration', async () => {
    const openEyes = async openParams => {
      const result = {openParams};
      return {
        checkAndClose: async checkParams => (result.checkParams = checkParams),
        getResults: async () => result,
      };
    };

    const globalConfig = {
      accessibilityValidation: {
        level: 'AAA',
        guidelinesVersion: 'WCAG_2_1',
      },
      ignoreRegions: 'global ignore',
      floatingRegions: [{selector: '.floating-region2'}],
      accessibilityRegions: [{selector: '.accessibility-region2', accessibilityType: 'LargeText'}],
      strictRegions: 'global strict',
      layoutRegions: 'global layout',
      contentRegions: 'global content',
      scriptHooks: 'global scriptHooks',
      sizeMode: 'global sizeMode',
      target: 'region',
      fully: 'global fully',
      selector: 'global-selector',
      tag: 'global tag',
      ignoreDisplacements: true,
      properties: [{name: 'global Custom property', value: null}],
      sendDom: 'global sendDom',
      visualGridOptions: 'global visualGridOptions',
      useDom: 'global useDom',
      enablePatterns: 'global enablePatterns',
    };

    const getStoriesWithConfig = makeGetStoriesWithConfig({config: globalConfig});
    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      openEyes,
      performance,
      timeItAsync,
    });

    const eyesOptions = {
      accessibilityValidation: {
        level: 'AA',
        guidelinesVersion: 'WCAG_2_0',
      },
      ignoreRegions: 'ignore',
      floatingRegions: [{selector: '.floating-region'}],
      accessibilityRegions: [{selector: '.accessibility-region', accessibilityType: 'XLText'}],
      strictRegions: 'strict',
      layoutRegions: 'layout',
      contentRegions: 'content',
      scriptHooks: 'scriptHooks',
      sizeMode: 'sizeMode',
      target: 'window',
      fully: 'fully',
      tag: 'tag',
      ignoreDisplacements: 'ignoreDisplacements',
      properties: [{name: 'Custom property', value: null}],
      sendDom: 'sendDom',
      visualGridOptions: 'visualGridOptions',
      useDom: 'useDom',
      enablePatterns: 'enablePatterns',
    };

    const baseStory = {name: 'name', kind: 'kind', parameters: {eyes: eyesOptions}};
    const baselineName = getStoryBaselineName(baseStory);
    const title = getStoryTitle(baseStory);
    const storiesWithConfig = getStoriesWithConfig({stories: [baseStory]});
    const results = await renderStory({story: storiesWithConfig.stories[0], snapshots: 'snapshot'});

    deleteUndefinedPropsRecursive(results);
    const expected = {
      openParams: {
        settings: {
          appName: 'app name',
          properties: [
            {
              name: 'Component name',
              value: 'kind',
            },
            {
              name: 'State',
              value: 'name',
            },
            ...globalConfig.properties,
            ...eyesOptions.properties,
          ],
          testName: baselineName,
          displayName: title,
        },
      },
      checkParams: {
        target: 'snapshot',
        settings: {
          ignoreRegions: 'ignore',
          floatingRegions: [
            {region: '.floating-region', offset: {bottom: 0, top: 0, left: 0, right: 0}},
          ],
          accessibilityRegions: [{region: '.accessibility-region', type: 'XLText'}],
          accessibilitySettings: {level: 'AA', version: 'WCAG_2_0'},
          strictRegions: 'strict',
          layoutRegions: 'layout',
          contentRegions: 'content',
          hooks: 'scriptHooks',
          sizeMode: 'sizeMode',
          fully: 'fully',
          tag: 'tag',
          sendDom: 'sendDom',
          ufgOptions: 'visualGridOptions',
          useDom: 'useDom',
          enablePatterns: 'enablePatterns',
          ignoreDisplacements: 'ignoreDisplacements',
        },
      },
    };
    expect(results).to.eql(expected);
  });

  it('sets performance timing', async () => {
    const openEyes = async openParams => {
      const result = {openParams};
      return {
        checkAndClose: async checkParams => (result.checkParams = checkParams),
        getResults: async () => result,
      };
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      openEyes,
      performance,
      timeItAsync,
    });

    const baseStory = {name: 'name', kind: 'kind'};
    const baselineName = getStoryBaselineName(baseStory);
    const story = {...baseStory, baselineName, config: {}};
    await renderStory({story, snapshots: 'snapshot'});
    expect(performance[baselineName]).not.to.equal(undefined);
  });

  it('throws error during testWindow', async () => {
    const openEyes = async _x => {
      return {
        checkAndClose: async _y => {
          await psetTimeout(0);
          throw new Error('bla');
        },
      };
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      openEyes,
      performance,
      timeItAsync,
    });
    const [{message}] = await presult(renderStory({story: {config: {}}, snapshots: 'snapshot'}));
    expect(message).to.equal('bla');
  });

  it('passes local ignore param for backward compatibility', async () => {
    const getStoriesWithConfig = makeGetStoriesWithConfig({config: {}});
    const openEyes = async openParams => {
      const result = {openParams};
      return {
        checkAndClose: async checkParams => (result.checkParams = checkParams),
        getResults: async () => result,
      };
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      openEyes,
      performance,
      timeItAsync,
    });
    const baseStory = {
      name: 'name',
      kind: 'kind',
      parameters: {
        eyes: {
          ignore: 'ignore',
        },
      },
    };
    const baselineName = getStoryBaselineName(baseStory);
    const title = getStoryTitle(baseStory);
    const storiesWithConfig = getStoriesWithConfig({stories: [baseStory]});
    const results = await renderStory({story: storiesWithConfig.stories[0], snapshots: 'snapshot'});

    deleteUndefinedPropsRecursive(results);
    const expected = {
      checkParams: {
        target: 'snapshot',
        settings: {
          ignoreRegions: 'ignore',
        },
      },
      openParams: {
        settings: {
          appName: 'app name',
          properties: [
            {name: 'Component name', value: 'kind'},
            {name: 'State', value: 'name'},
          ],
          testName: baselineName,
          displayName: title,
        },
      },
    };
    expect(results).to.eql(expected);
  });

  it('ignoreRegions take precedence over ignore param', async () => {
    const getStoriesWithConfig = makeGetStoriesWithConfig({config: {}});
    const openEyes = async openParams => {
      const result = {openParams};
      return {
        checkAndClose: async checkParams => (result.checkParams = checkParams),
        getResults: async () => result,
      };
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      openEyes,
      performance,
      timeItAsync,
    });
    const baseStory = {
      name: 'name',
      kind: 'kind',
      parameters: {
        eyes: {
          ignore: 'ignore',
          ignoreRegions: 'ignoreRegions',
        },
      },
    };
    const baselineName = getStoryBaselineName(baseStory);
    const title = getStoryTitle(baseStory);
    const storiesWithConfig = getStoriesWithConfig({stories: [baseStory]});
    const results = await renderStory({story: storiesWithConfig.stories[0], snapshots: 'snapshot'});

    deleteUndefinedPropsRecursive(results);
    const expected = {
      checkParams: {
        target: 'snapshot',
        settings: {
          ignoreRegions: 'ignoreRegions',
        },
      },
      openParams: {
        settings: {
          appName: 'app name',
          properties: [
            {name: 'Component name', value: 'kind'},
            {name: 'State', value: 'name'},
          ],
          testName: baselineName,
          displayName: title,
        },
      },
    };
    expect(results).to.eql(expected);
  });

  it('should abort if snapshot is undefined', async () => {
    const openEyes = async () => {
      return {
        checkAndClose: async () => {
          throw new Error(
            'Oops, checkAndClose was called! It should not be called because the story is aborted due to the snapshot not being passed to renderStory',
          );
        },
        abort: async () => {},
      };
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      performance,
      timeItAsync,
      openEyes,
    });

    const baseStory = {
      name: 'name',
      kind: 'kind',
    };
    const baselineName = getStoryBaselineName(baseStory);
    const story = {
      baselineName,
      config: {},
    };

    const [err, _results] = await presult(
      renderStory({
        story,
        snapshots: undefined,
        url: 'url',
      }),
    );

    expect(err.message).to.equal('Failed to get story data for kind: name, test was aborted');
  });

  it('should throw an error when openEyes fails', async () => {
    const openEyes = async () => {
      throw new Error('openEyes failed');
    };

    const renderStory = makeRenderStory({
      ...defaultSettings,
      logger,
      performance,
      timeItAsync,
      openEyes,
    });

    const baseStory = {
      name: 'name',
      kind: 'kind',
    };
    const baselineName = getStoryBaselineName(baseStory);
    const title = getStoryTitle(baseStory);
    const story = {
      ...baseStory,
      storyTitle: title,
      baselineName,
      config: {
        renderers: [{name: 'chrome', width: 800, height: 600}],
      },
    };

    const [err, _results] = await presult(
      renderStory({
        story,
        snapshots: 'snapshot',
        url: 'url',
      }),
    );

    expect(err.message).to.equal('openEyes failed');
  });
});

function deleteUndefinedPropsRecursive(obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop] === undefined) {
        delete obj[prop];
      }
      if (typeof obj[prop] === 'object') {
        deleteUndefinedPropsRecursive(obj[prop]);
      }
    }
  }
}
