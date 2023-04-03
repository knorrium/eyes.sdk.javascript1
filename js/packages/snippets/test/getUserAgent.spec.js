const assert = require('assert')
const {getUserAgent} = require('../dist/index')

describe('getUserAgent', () => {
  const url = 'https://applitools.github.io/demo/TestPages/SnippetsTestPage/'

  describe('chrome', () => {
    let page

    before(async function() {
      page = await global.getDriver('chrome')
      if (!page) {
        this.skip()
      }
    })

    it('return user agent', async () => {
      await page.goto(url)
      let result
      do {
        result = JSON.parse(await page.evaluate(getUserAgent))
      } while (result.status && result.status === 'WIP')
      const browserInfo = result.value
      assert.deepStrictEqual(browserInfo, {
        legacy:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        brands: [{brand: 'browser', version: '1'}],
        mobile: false,
        model: 'Laptop',
        platform: 'macOS',
        platformVersion: 'Monterey',
      })
    })
  })

  for (const name of ['internet explorer', 'ios safari']) {
    const expectedBrowserInfos = {
      'internet explorer':
        'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; rv:11.0) like Gecko',
      'ios safari':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
    }

    describe(name, () => {
      let driver

      before(async function() {
        driver = await global.getDriver(name)
        if (!driver) {
          this.skip()
        }
      })

      it('return user agent', async () => {
        await driver.url(url)
        let result
        do {
          result = JSON.parse(await driver.execute(getUserAgent))
        } while (result.status === 'WIP')
        const browserInfo = result.value
        assert.deepStrictEqual(browserInfo, expectedBrowserInfos[name])
      })
    })
  }
})
