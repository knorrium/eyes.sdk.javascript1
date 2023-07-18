const {describe, it} = require('mocha');
const {expect} = require('chai');
const executeRenders = require('../../src/executeRenders');
const {presult} = require('@applitools/functional-commons');

describe('executeRenders', () => {
  it('should call executeRender for fakeIE and non fakeIE stories', async () => {
    const renderStoriesCalls = [];
    const viewport = {width: 800, height: 600};
    const storiesByBrowserWithConfig = {
      stories: [
        {
          hello: 'world',
          config: {
            renderers: [{name: 'chrome', ...viewport}],
          },
        },
      ],
      storiesWithIE: [
        {
          hello: 'world',
          config: {
            renderers: [{name: 'ie', ...viewport}],
          },
        },
      ],
    };
    await executeRenders({
      timeItAsync: (_a, cb) => cb(),
      renderStories: async function (stories) {
        renderStoriesCalls.push(stories);
        return stories;
      },
      pagePool: {},
      storiesByBrowserWithConfig,
      pagePool: {
        drain: () => {},
      },
      setTransitioningIntoIE: () => {},
      logger: {
        verbose: () => {},
      },
      setRenderIE: () => {},
    });

    expect(renderStoriesCalls).to.eql([
      storiesByBrowserWithConfig.stories,
      storiesByBrowserWithConfig.storiesWithIE,
    ]);
  });

  it('should drain pool in case of IE', async () => {
    const renderStoriesCalls = [];
    let poolDrained = false;
    let renderIE = false;
    const viewport = {width: 800, height: 600};
    const storiesByBrowserWithConfig = {
      stories: [
        {
          hello: 'world',
          config: {
            renderers: [{name: 'chrome', ...viewport}],
          },
        },
      ],
      storiesWithIE: [
        {
          hello: 'world',
          config: {
            renderers: [{name: 'ie', ...viewport}],
            fakeIE: true,
          },
        },
      ],
    };
    const result = await executeRenders({
      timeItAsync: (_a, cb) => cb(),
      setTransitioningIntoIE: () => {},
      renderStories: async function (stories) {
        renderStoriesCalls.push(stories);
        return stories;
      },
      pagePool: {drain: () => (poolDrained = true)},
      storiesByBrowserWithConfig,
      logger: {
        verbose: () => {},
      },
      setRenderIE: value => (renderIE = value),
    });

    expect(poolDrained).to.be.true;
    expect(renderIE).to.be.true;
    expect(result).to.eql([
      ...storiesByBrowserWithConfig.stories,
      ...storiesByBrowserWithConfig.storiesWithIE,
    ]);
    expect(renderStoriesCalls).to.eql([
      storiesByBrowserWithConfig.stories,
      storiesByBrowserWithConfig.storiesWithIE,
    ]);
  });

  it('should handle exceptions in renderStories', async () => {
    let counter = 0;
    const viewport = {width: 800, height: 600};
    const storiesByBrowserWithConfig = {
      stories: [
        {
          hello: 'world',
          config: {
            renderers: [
              {name: 'chrome', ...viewport},
              {name: 'firefox', ...viewport},
            ],
          },
        },
      ],
      storiesWithIE: [
        {
          hello: 'world',
          config: {
            renderers: [{name: 'ie', ...viewport}],
            fakeIE: true,
          },
        },
      ],
    };

    const [err, _result] = await presult(
      executeRenders({
        setTransitioningIntoIE: () => {},
        timeItAsync: (_a, cb) => cb(),
        renderStories: async function (stories, _config) {
          if (counter === 0) {
            counter++;
            throw new Error('omg! something went wrong');
          } else {
            return stories;
          }
        },
        pagePool: {},
        storiesByBrowserWithConfig,
        logger: {
          verbose: () => {},
          log: () => {},
        },
        setRenderIE: () => {},
      }),
    );
    expect(err).not.to.be.undefined;
    expect(err.message).to.equal('omg! something went wrong');
  });
});
