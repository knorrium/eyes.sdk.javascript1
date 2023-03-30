async function executeRenders({
  timeItAsync,
  setTransitioningIntoIE,
  renderStories,
  pagePool,
  storiesByBrowserWithConfig,
  logger,
  setRenderIE,
}) {
  const results = [];
  if (storiesByBrowserWithConfig.stories.length) {
    logger.verbose(`executing render stories for non fakeIE browsers`);
    const result = await timeItAsync('renderStories', () =>
      renderStories(storiesByBrowserWithConfig.stories, false),
    );
    results.push(...result);
  }
  if (storiesByBrowserWithConfig.storiesWithIE.length) {
    logger.verbose(`executing render stories for fakeIE`);
    setRenderIE(true);
    setTransitioningIntoIE(true);
    await pagePool.drain();
    setTransitioningIntoIE(false);

    const result = await timeItAsync('renderStories', () =>
      renderStories(storiesByBrowserWithConfig.storiesWithIE, true),
    );
    results.push(...result);
  }
  return results;
}

module.exports = executeRenders;
