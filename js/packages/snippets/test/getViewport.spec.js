const assert = require('assert')
const {getViewport} = require('../dist/index')

describe('getViewport', () => {
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('chrome', () => {
    let page

    before(async function() {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('return viewport size', async () => {
      await page.goto(url)
      const viewportSize = await page.evaluate(getViewport)
      assert.deepStrictEqual(viewportSize, {viewportSize: {width: 800, height: 600}, viewportScale: 1, pixelRatio: 1})
    })
  })

  for (const name of ['internet explorer', 'ios safari']) {
    const expectedViewportSizes = {
      'internet explorer': {viewportSize: {width: 800, height: 600}, viewportScale: null, pixelRatio: 1},
      'ios safari': {viewportSize: {width: 375, height: 635}, viewportScale: 1, pixelRatio: 3},
    }

    describe(name, () => {
      let driver

      before(async function() {
        driver = await global.getDriver(name)
        if (!driver) {
          this.skip()
        }
      })

      it('return viewport size', async () => {
        await driver.url(url)
        const viewportSize = await driver.execute(getViewport)
        assert.deepStrictEqual(viewportSize, expectedViewportSizes[name])
      })
    })
  }
})
