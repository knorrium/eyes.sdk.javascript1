const {presult} = require('@applitools/functional-commons');
const browserLog = require('./browserLog');
const fakeIE = require('./fakeIE');

function makeInitPage({iframeUrl, config, browser, logger, getTransitiongIntoIE, getRenderIE}) {
  const browserContexts = [browser.defaultBrowserContext()];

  return async function initPage({pageId, pagePool}) {
    logger.log('initializing puppeteer page number ', pageId);
    const pages = await browserContexts[browserContexts.length - 1].pages();
    if (pages.length === 5) {
      const browserContext = await browser.createIncognitoBrowserContext();
      browserContexts.push(browserContext);
    }
    const page = await browserContexts[browserContexts.length - 1].newPage();

    if (config.viewportSize) {
      await page.setViewport(config.viewportSize);
    }

    if (config.showLogs) {
      browserLog({
        page,
        onLog: text => {
          if (text.match(/\[dom-snapshot\]/)) {
            logger.log(`tab ${pageId}: ${text}`);
          }
        },
      });
    }

    if (config.puppeteerExtraHTTPHeaders) {
      await page.setExtraHTTPHeaders(config.puppeteerExtraHTTPHeaders);
    }

    page.on('close', async () => {
      if (pagePool.isClosed) return;
      if (!getTransitiongIntoIE() && pagePool.isInPool(pageId)) {
        logger.log(
          `Puppeteer page closed [page ${pageId}] while still in page pool, creating a new one instead`,
        );
        await pagePool.removeAndAddPage(pageId);
      }
    });

    page.on('error', async err => {
      logger.log(`Puppeteer error for page ${pageId}:`, err);
      await pagePool.removeAndAddPage(pageId);
    });

    if (getRenderIE()) {
      await fakeIE({logger, page, pageId});
    }

    const [err] = await presult(page.goto(iframeUrl, {timeout: config.readStoriesTimeout}));
    if (err) {
      logger.log(`error navigating to iframe.html`, err);
      if (pagePool.isInPool(pageId)) {
        throw err;
      }
    }

    return page;
  };
}

module.exports = makeInitPage;
