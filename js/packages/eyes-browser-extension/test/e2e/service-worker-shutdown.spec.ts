import setupEyes from '../utils/setup-eyes.js'
import {Builder, type WebDriver} from 'selenium-webdriver'
import path from 'path'

describe('Service worker', () => {
  let driver: WebDriver, eyes: any

  beforeEach(async () => {
    const extensionPath = path.resolve(process.cwd(), './dist')
    driver = await new Builder()
      .withCapabilities({
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [
            `--load-extension=${extensionPath}`,
            `--disable-extensions-except=${extensionPath}`,
            // '--auto-open-devtools-for-tabs',
          ],
        },
      })
      .build()

    eyes = setupEyes({
      vg: true,
      displayName: 'service worker shutdown',
      browsersInfo: [{name: 'chrome', width: 640, height: 480}],
      baselineName: 'ServiceWorkerShutdown',
      driver,
    })
  })

  afterEach(async () => {
    await driver.close()
  })

  it("service worker does't shut down after more than 30 seconds", async () => {
    await driver.get('https://applitools.github.io/demo/TestPages/ufg.html')
    await eyes.open(driver, 'Applitools Eyes SDK', 'ServiceWorkerShutdown', {width: 700, height: 460})

    await waitWithSpinner(40_000)

    await eyes.check({fully: false})
    await eyes.close(false)
  })
})

async function waitWithSpinner(ms: number) {
  const {default: ora} = await import('ora')
  const spinner = ora('Elapsed 0').start()
  const interval = setInterval(() => {
    const elapsed = Number(spinner.text.replace('Elapsed ', ''))
    spinner.text = `Elapsed ${elapsed + 1}`
  }, 1000)
  await new Promise(r => setTimeout(r, ms))
  clearInterval(interval)
  spinner.info()
}
