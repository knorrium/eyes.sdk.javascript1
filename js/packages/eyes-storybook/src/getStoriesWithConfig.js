const {splitConfigsByBrowser, shouldRenderIE} = require('./shouldRenderIE');
const getStoryTitle = require('./getStoryTitle');
const {transformConfig} = require('./generateConfig');
const {checkSettingsParams} = require('./checkSettingsParams');
const getStoryBaselineName = require('./getStoryBaselineName');

function makeGetStoriesWithConfig({config}) {
  const storiesWithConfig = new Map();
  const storiesWithConfigIE = new Map();
  const basicConfig = {...config};
  delete basicConfig.storyConfiguration;

  return function getStoriesWithConfig({stories, logger = console}) {
    const storiesWithTitle = addStoryTitleAndBaselineName(stories);
    if (!config.storyConfiguration) {
      addConfigToStories({config, stories: storiesWithTitle, isStoryConfig: false});
    } else {
      const storyConfigurations = Array.isArray(config.storyConfiguration)
        ? config.storyConfiguration
        : [config.storyConfiguration];
      let remainingStories = [...storiesWithTitle];
      for (const storyConfig of storyConfigurations) {
        const filterStories = storyConfig.stories;
        delete storyConfig.stories;

        if (filterStories) {
          const storiesSubset = storiesWithTitle
            .filter(story => {
              try {
                return filterStories(story);
              } catch (err) {
                logger.log(`An error was thrown from substory function: ${err}`);
                return;
              }
            })
            .filter(Boolean);

          const storyConfigReduced = allowedProps(storyConfig);
          transformConfig(storyConfigReduced);
          addConfigToStories({
            config: storyConfigReduced,
            stories: storiesSubset,
            isStoryConfig: true,
          });

          remainingStories = remainingStories.filter(story => !storiesSubset.includes(story));
        }
      }

      if (remainingStories.length) {
        addConfigToStories({config: basicConfig, stories: remainingStories, isStoryConfig: true});
      }
    }
    return {
      stories: Array.from(storiesWithConfig.values()),
      storiesWithIE: Array.from(storiesWithConfigIE.values()),
    };
  };

  function addConfigToStories({config, stories, isStoryConfig}) {
    const configs = config.fakeIE ? splitConfigsByBrowser(config) : [config];
    for (const config of configs) {
      for (const story of stories) {
        addConfigToStory({
          story,
          config,
          isIE: shouldRenderIE(config),
          isStoryConfig,
        });
      }
    }
  }

  function addConfigToStory({story, config, isIE, isStoryConfig}) {
    const storiesToUpdate = isIE ? storiesWithConfigIE : storiesWithConfig;
    const storyEyesParameters = {...story.parameters?.eyes};
    transformConfig(storyEyesParameters);
    storiesToUpdate.set(story.baselineName, {
      ...story,
      config: {
        ...basicConfig,
        ...storiesToUpdate.get(story.baselineName)?.config,
        ...config,
        ...storyEyesParameters,
        properties: [
          ...(isStoryConfig ? basicConfig.properties || [] : []),
          ...(storiesToUpdate.get(story.baselineName)?.config.properties || []),
          ...(config.properties || []),
          ...(story.parameters?.eyes?.properties || []),
        ],
      },
    });
  }

  function addStoryTitleAndBaselineName(stories) {
    return stories.map(story => {
      return {
        ...story,
        storyTitle: getStoryTitle(story),
        baselineName: getStoryBaselineName(story),
      };
    });
  }

  function allowedProps(config) {
    const configKeys = Object.keys(config);
    for (const key of configKeys) {
      if (!checkSettingsParams.includes(key)) {
        delete config[key];
      }
    }
    return config;
  }
}

module.exports = makeGetStoriesWithConfig;
