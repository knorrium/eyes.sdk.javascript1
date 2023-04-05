const {makeDriver, test, logger} = require('../e2e')

describe('screenshoter web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'chrome', emulation: 'Pixel 2 XL', logger})
    await driver.visit('https://applitools.github.io/demo/')
  })

  after(async () => {
    await destroyDriver()
  })

  it('take full page screenshot on page which fits in viewport', async () => {
    await test({
      type: 'web',
      tag: 'page-fully-not-scrollable-emulation',
      scrollingMode: 'scroll',
      overlap: {top: 0, bottom: 0},
      fully: true,
      framed: true,
      driver,
      logger,
    })
  })
})
