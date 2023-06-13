const assert = require('assert')
const {reloadPage} = require('../dist/index')

describe('reloadPage', () => {
  const url = 'https://applitools.github.io/demo/TestPages/OnLoad/'
  describe('chrome', () => {
    let page

    before(async function () {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('works', async () => {
      await page.goto(url)
      await page.setViewportSize({width: 400, height: 600})
      await page.evaluate(reloadPage)
      await page.waitForNavigation()
      const isElementChanged = await page.evaluate(() => {
        return !!document.querySelector('#target').style.backgroundColor
      })
      assert.ok(isElementChanged)
    })
  })

  for (const name of ['internet explorer']) {
    describe(name, () => {
      let driver

      before(async function () {
        driver = await global.getDriver(name)
        if (!driver) {
          this.skip()
        }
      })

      it('works', async () => {
        await driver.url(url)
        await driver.setWindowSize(300, 500)
        await driver.execute(reloadPage)
        const isElementChanged = await driver.execute(function () {
          return !!document.querySelector('#target').style.backgroundColor
        })
        assert.ok(isElementChanged)
      })
    })
  }
})
