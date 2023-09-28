const {makeDriver, sleep, test, logger} = require('../e2e')

describe('screenshoter ios web', () => {
  let driver, destroyDriver

  before(async () => {
    ;[driver, destroyDriver] = await makeDriver({type: 'ios', app: 'safari', logger})
  })

  after(async () => {
    await destroyDriver()
  })

  it('take viewport screenshot after switchWorld to NATIVE_APP', async () => {
    await driver.visit('https://applitools.github.io/demo/TestPages/PageWithBurgerMenu/')
    await driver.switchWorld('NATIVE_APP')
    await sleep(5000)

    await test({
      type: 'ios-web',
      tag: 'page-native-app',
      driver,
      logger,
    })
  })
})
