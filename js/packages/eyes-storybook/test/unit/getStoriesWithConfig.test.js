const {describe, it} = require('mocha');
const {expect} = require('chai');
const makeGetStoriesWithConfig = require('../../src/getStoriesWithConfig');
const getStoryTitle = require('../../src/getStoryTitle');
const getStoryBaselineName = require('../../src/getStoryBaselineName');

describe('getStoriesWithConfig', () => {
  const stories = [
    {
      name: 'background color',
      kind: 'Button',
      id: 'button--background-color',
    },
    {
      name: 'with text',
      kind: 'Button',
      id: 'button--with-text',
    },
    {
      name: 'with some text',
      kind: 'Text',
      id: 'text--with-some-text',
    },
  ];

  it('single subset of stories', () => {
    const subConfig = {
      waitBeforeCapture: 20,
      matchLevel: 'strict',
      browser: {width: 400, height: 400, name: 'chrome'},
    };

    const expectedSubConfig = {
      waitBeforeCapture: 20,
      matchLevel: 'strict',
      renderers: [{width: 400, height: 400, name: 'chrome'}],
    };

    const config = {
      matchLevel: 'layout',
      waitBeforeCapture: 1000,
      batchName: 'this is an example',
      renderers: [{name: 'chrome', width: 800, height: 600}],
      storyConfiguration: {
        stories: ({kind}) => {
          return kind === 'Button';
        },
        ...subConfig,
      },
    };

    const expectedConfig = {...config};
    delete expectedConfig.storyConfiguration;

    const getStoriesWithConfig = makeGetStoriesWithConfig({config});

    const expected = {
      stories: [
        {
          name: 'background color',
          kind: 'Button',
          id: 'button--background-color',
          config: {
            ...expectedConfig,
            ...expectedSubConfig,
          },
        },
        {
          name: 'with text',
          kind: 'Button',
          id: 'button--with-text',
          config: {
            ...expectedConfig,
            ...expectedSubConfig,
          },
        },
        {
          name: 'with some text',
          kind: 'Text',
          id: 'text--with-some-text',
          config: expectedConfig,
        },
      ].map(story => {
        return {
          ...story,
          storyTitle: getStoryTitle(story),
          baselineName: getStoryBaselineName(story),
        };
      }),
      storiesWithIE: [],
    };
    const actual = getStoriesWithConfig({stories, config});
    expect(actual).to.eql(expected);
  });

  it('multiple subsets of stories', () => {
    const subConfig1 = {
      matchLevel: 'strict',
      browser: {width: 400, height: 400},
    };

    const expectedSubConfig1 = {
      matchLevel: 'strict',
      renderers: [{name: 'chrome', width: 400, height: 400}],
    };

    const subConfig2 = {
      browser: {width: 1000, height: 800},
      layoutBreakpoints: true,
    };

    const expectedSubConfig2 = {
      renderers: [{name: 'chrome', width: 1000, height: 800}],
      layoutBreakpoints: true,
    };

    const config = {
      matchLevel: 'layout',
      waitBeforeCapture: 1000,
      batchName: 'this is an example',
      renderers: [{width: 800, height: 600, name: 'chrome'}],
      serverUrl: 'https://myeyes.applitools.com',
      storyConfiguration: [
        {
          stories: ({id}) => {
            return id === 'button--background-color';
          },
          ...subConfig1,
        },
        {
          stories: ({id}) => {
            return id === 'button--with-text';
          },
          ...subConfig2,
        },
      ],
    };

    const getStoriesWithConfig = makeGetStoriesWithConfig({config});

    const expectedConfig = {...config};
    delete expectedConfig.storyConfiguration;

    const expected = {
      stories: [
        {
          name: 'background color',
          kind: 'Button',
          id: 'button--background-color',
          config: {...expectedConfig, ...expectedSubConfig1},
        },
        {
          name: 'with text',
          kind: 'Button',
          id: 'button--with-text',
          config: {...expectedConfig, ...expectedSubConfig2},
        },
        {
          name: 'with some text',
          kind: 'Text',
          id: 'text--with-some-text',
          config: expectedConfig,
        },
      ].map(story => {
        return {
          ...story,
          storyTitle: getStoryTitle(story),
          baselineName: getStoryBaselineName(story),
        };
      }),
      storiesWithIE: [],
    };
    const actual = getStoriesWithConfig({stories, config});
    expect(actual).to.eql(expected);
  });

  it('merge multiple subsets', () => {
    const config = {
      matchLevel: 'layout',
      waitBeforeCapture: 1000,
      batchName: 'this is an example',
      renderers: [{name: 'chrome', width: 800, height: 600}],
      storyConfiguration: [
        {
          stories: ({storyTitle}) => storyTitle.includes('text'), // this will catch "text--with-some-text" AND "button--with-text"
          waitBeforeCapture: 5000,
          layoutBreakpoints: true,
        },
        {
          stories: ({kind}) => {
            return kind === 'Text'; // this will catch "text--with-some-text"
          },
          waitBeforeCapture: 20,
          matchLevel: 'strict',
          browser: {width: 400, height: 400, name: 'chrome'},
        },
        {
          stories: ({id}) => id === 'text--with-some-text',
          useDom: true,
        },
      ],
    };

    const getStoriesWithConfig = makeGetStoriesWithConfig({config});

    const expectedConfig = {...config};
    delete expectedConfig.storyConfiguration;

    const expected = {
      stories: [
        {
          name: 'with text',
          kind: 'Button',
          id: 'button--with-text',
          config: {
            ...expectedConfig,
            waitBeforeCapture: 5000,
            layoutBreakpoints: true,
          },
        },
        {
          name: 'with some text',
          kind: 'Text',
          id: 'text--with-some-text',
          config: {
            ...expectedConfig,
            waitBeforeCapture: 20,
            matchLevel: 'strict',
            renderers: [{width: 400, height: 400, name: 'chrome'}],
            useDom: true,
            layoutBreakpoints: true,
          },
        },
        {
          name: 'background color',
          kind: 'Button',
          id: 'button--background-color',
          config: expectedConfig,
        },
      ].map(story => {
        return {
          ...story,
          storyTitle: getStoryTitle(story),
          baselineName: getStoryBaselineName(story),
        };
      }),
      storiesWithIE: [],
    };
    const actual = getStoriesWithConfig({stories, config});
    expect(actual).to.eql(expected);
  });

  it('fake ie and chrome subset', () => {
    const subConfig = {
      matchLevel: 'strict',
      browser: {width: 400, height: 400, name: 'chrome'},
      layoutRegions: [{selector: '.layout-region'}],
    };

    const expectedSubConfig = {
      matchLevel: 'strict',
      renderers: [{width: 400, height: 400, name: 'chrome'}],
      layoutRegions: [{selector: '.layout-region'}],
    };

    const config = {
      matchLevel: 'layout',
      waitBeforeCapture: 1000,
      batchName: 'this is an example',
      renderers: [{name: 'chrome', width: 800, height: 600}],
      storyConfiguration: [
        {
          stories: ({kind}) => {
            return kind === 'Button';
          },
          ...subConfig,
        },
        {
          stories: ({kind}) => kind === 'Text',
          fakeIE: true,
          browser: [
            {name: 'chrome', width: 800, height: 600},
            {name: 'ie', width: 400, height: 400},
          ],
        },
      ],
    };

    const getStoriesWithConfig = makeGetStoriesWithConfig({config});

    const expectedConfig = {...config};
    delete expectedConfig.storyConfiguration;

    const expected = {
      stories: [
        {
          name: 'background color',
          kind: 'Button',
          id: 'button--background-color',
          config: {...expectedConfig, ...expectedSubConfig},
        },
        {
          name: 'with text',
          kind: 'Button',
          id: 'button--with-text',
          config: {...expectedConfig, ...expectedSubConfig},
        },
        {
          name: 'with some text',
          kind: 'Text',
          id: 'text--with-some-text',
          config: {
            ...expectedConfig,
            renderers: [{name: 'chrome', width: 800, height: 600}],
            fakeIE: true,
          },
        },
      ].map(story => {
        return {
          ...story,
          storyTitle: getStoryTitle(story),
          baselineName: getStoryBaselineName(story),
        };
      }),
      storiesWithIE: [
        {
          name: 'with some text',
          kind: 'Text',
          id: 'text--with-some-text',
          config: {
            ...expectedConfig,
            fakeIE: true,
            renderers: [{width: 400, height: 400, name: 'ie'}],
          },
        },
      ].map(story => {
        return {
          ...story,
          storyTitle: getStoryTitle(story),
          baselineName: getStoryBaselineName(story),
        };
      }),
    };

    const actual = getStoriesWithConfig({stories, config});
    expect(actual).to.eql(expected);
  });

  it('story config method with error', async () => {
    const config = {
      matchLevel: 'layout',
      waitBeforeCapture: 1000,
      batchName: 'this is an example',
      renderers: [{width: 800, height: 600}],
      storyConfiguration: {
        stories: () => {
          throw new Error(`some error message`);
        },
        matchLevel: 'strict',
        browser: {width: 400, height: 400, name: 'chrome'},
      },
    };

    const expectedConfig = {...config};
    delete expectedConfig.storyConfiguration;

    const getStoriesWithConfig = makeGetStoriesWithConfig({config});

    const expected = {
      stories: [
        {
          name: 'background color',
          kind: 'Button',
          id: 'button--background-color',
          config: expectedConfig,
        },
        {
          name: 'with text',
          kind: 'Button',
          id: 'button--with-text',
          config: expectedConfig,
        },
        {
          name: 'with some text',
          kind: 'Text',
          id: 'text--with-some-text',
          config: expectedConfig,
        },
      ].map(story => {
        return {
          ...story,
          storyTitle: getStoryTitle(story),
          baselineName: getStoryBaselineName(story),
        };
      }),
      storiesWithIE: [],
    };
    const actual = getStoriesWithConfig({stories, config});
    expect(actual).to.eql(expected);
  });

  it('empty stories subset', () => {
    const config = {
      matchLevel: 'layout',
      waitBeforeCapture: 1000,
      batchName: 'this is an example',
      renderers: [{width: 800, height: 600}],
      storyConfiguration: {
        stories: ({kind}) => {
          return kind === 'MissingStories';
        },
        matchLevel: 'strict',
        browser: {width: 400, height: 400},
      },
    };

    const getStoriesWithConfig = makeGetStoriesWithConfig({config});

    const expectedConfig = {...config};
    delete expectedConfig.storyConfiguration;

    const expected = {
      stories: [
        {
          name: 'background color',
          kind: 'Button',
          id: 'button--background-color',
          config: expectedConfig,
        },
        {
          name: 'with text',
          kind: 'Button',
          id: 'button--with-text',
          config: expectedConfig,
        },
        {
          name: 'with some text',
          kind: 'Text',
          id: 'text--with-some-text',
          config: expectedConfig,
        },
      ].map(story => {
        return {
          ...story,
          storyTitle: getStoryTitle(story),
          baselineName: getStoryBaselineName(story),
        };
      }),
      storiesWithIE: [],
    };

    const actual = getStoriesWithConfig({stories, config});
    expect(actual).to.eql(expected);
  });
});
