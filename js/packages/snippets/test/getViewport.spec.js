const assert = require('assert')
const {getViewport} = require('../dist/index')

describe('getViewport', () => {
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('chrome', () => {
    let page

    before(async function () {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('return viewport', async () => {
      await page.goto(url)
      const viewport = await page.evaluate(getViewport)
      assert.deepStrictEqual(viewport, {
        viewportSize: {width: 800, height: 600},
        viewportScale: 1,
        pixelRatio: 1,
        orientation: 'landscape',
      })
    })
  })

  for (const name of ['internet explorer', 'ios safari']) {
    const expectedViewportSizes = {
      'internet explorer': {
        viewportSize: {width: 800, height: 600},
        viewportScale: null,
        pixelRatio: 1,
        orientation: null,
      },
      'ios safari': {viewportSize: {width: 375, height: 635}, viewportScale: 1, pixelRatio: 3, orientation: 'portrait'},
    }

    describe(name, () => {
      let driver

      before(async function () {
        driver = await global.getDriver(name)
        if (!driver) {
          this.skip()
        }
      })

      it('return viewport', async () => {
        await driver.url(url)
        const viewportSize = await driver.execute(getViewport)
        assert.deepStrictEqual(viewportSize, expectedViewportSizes[name])
      })
    })
  }
})
