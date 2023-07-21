'use strict';
const {deprecationWarning} = require('./errMessages');
const throat = require('throat');

function makeRenderStory({
  logger,
  openEyes,
  performance,
  timeItAsync,
  storyDataGap,
  appName,
  closeSettings,
  serverSettings,
}) {
  const throttle = throat(storyDataGap);
  return function renderStory({story, snapshots, url}) {
    const config = story.config;
    const {name, kind, hasPlayFunction} = story;
    const baselineName = story.baselineName;
    const title = story.storyTitle;
    const {
      ignoreDisplacements,
      ignoreRegions,
      accessibilityRegions,
      floatingRegions,
      strictRegions,
      contentRegions,
      layoutRegions,
      scriptHooks,
      sizeMode,
      target,
      fully,
      selector,
      tag,
      properties,
      ignore,
      accessibilityValidation,
      sendDom,
      visualGridOptions,
      useDom,
      enablePatterns,
      renderers,
      keepBatchOpen,
      batch,
      branchName,
      parentBranchName,
      baselineBranchName,
      compareWithParentBranch,
      ignoreGitMergeBase,
      baselineEnvName,
      envName,
      ignoreCaret,
      matchLevel,
      ignoreBaseline,
    } = config;

    if (sizeMode) {
      console.log(deprecationWarning({deprecatedThing: "'sizeMode'", newThing: "'target'"}));
    }

    let ignoreRegionsBackCompat = ignoreRegions;
    if (ignore && ignoreRegions === undefined) {
      console.log(deprecationWarning({deprecatedThing: "'ignore'", newThing: "'ignoreRegions'"}));
      ignoreRegionsBackCompat = ignore;
    }

    logger.log(`running story ${title} with baseline ${baselineName}`);

    const storyProperties = [
      {name: 'Component name', value: kind},
      {name: 'State', value: name},
      ...(properties || []),
    ];
    if (hasPlayFunction) {
      storyProperties.push({name: 'Storybook play function', value: 'true'});
    }

    const openParams = {
      testName: baselineName,
      displayName: title,
      properties: storyProperties,
      appName,
      keepBatchOpen,
      batch,
      branchName,
      parentBranchName,
      baselineBranchName,
      compareWithParentBranch,
      ignoreGitBranching: ignoreGitMergeBase,
      baselineEnvName,
      environmentName: envName,
      ignoreBaseline,
      ...serverSettings,
    };
    const checkParams = {
      url,
      ignoreRegions: ignoreRegionsBackCompat,
      floatingRegions: mapFloatingRegions(floatingRegions),
      layoutRegions,
      strictRegions,
      contentRegions,
      accessibilityRegions: mapAccessibilityRegions(accessibilityRegions),
      renderers,
      hooks: scriptHooks,
      sizeMode,
      region: target === 'region' ? selector : undefined,
      fully,
      tag,
      sendDom,
      ufgOptions: visualGridOptions,
      useDom,
      enablePatterns,
      ignoreDisplacements,
      fully,
      ignoreCaret,
      matchLevel,
      accessibilitySettings: accessibilityValidation
        ? {
            level: accessibilityValidation ? accessibilityValidation.level : undefined,
            version: accessibilityValidation
              ? accessibilityValidation.guidelinesVersion
              : undefined,
          }
        : undefined,
    };

    return timeItAsync(baselineName, async () => {
      const eyes = await openEyes({settings: openParams});
      return new Promise((resolve, reject) => {
        throttle(async () => {
          try {
            await eyes.checkAndClose({
              target: snapshots,
              settings: {...checkParams, ...closeSettings},
            });
            const results = await eyes.getResults();
            resolve(results);
          } catch (err) {
            reject(err);
          }
        });
      });
    }).then(onDoneStory);

    function mapAccessibilityRegions(accessabilityRegions) {
      if (!accessabilityRegions) return;
      if (!Array.isArray(accessabilityRegions)) accessabilityRegions = [accessabilityRegions];
      return accessabilityRegions.map(region => {
        const res = {
          type: region.accessibilityType,
        };
        if (region.selector) {
          res.region = region.selector;
        } else if (region.region && isRegion(region.region)) {
          res.region = {
            y: region.region.top,
            x: region.region.left,
            width: region.region.width,
            height: region.region.height,
          };
        } else {
          return;
        }
        return res;
      });
    }

    function mapFloatingRegions(floatingRegions) {
      if (!floatingRegions) return;
      if (!Array.isArray(floatingRegions)) floatingRegions = [floatingRegions];
      return floatingRegions.map(region => {
        let res = {
          offset: {
            bottom: region.maxDownOffset || 0,
            left: region.maxLeftOffset || 0,
            top: region.maxUpOffset || 0,
            right: region.maxRightOffset || 0,
          },
        };
        if (region.selector) {
          res.region = region.selector;
        } else if (region.region && isRegion(region.region)) {
          res.region = {
            y: region.region.top,
            x: region.region.left,
            width: region.region.width,
            height: region.region.height,
          };
        } else {
          return;
        }
        return res;
      });
    }

    function isRegion(region) {
      if (
        region.hasOwnProperty('top') &&
        region.hasOwnProperty('left') &&
        region.hasOwnProperty('width') &&
        region.hasOwnProperty('height')
      ) {
        return true;
      }
    }

    function onDoneStory(results) {
      logger.log('finished story', baselineName, 'in', performance[baselineName]);
      return results;
    }
  };
}

module.exports = makeRenderStory;
