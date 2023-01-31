import {type Driver} from '@applitools/driver'

export async function extractBrokerUrl(driver: Driver<unknown, unknown, unknown, unknown>): Promise<string> {
  try {
    const selector = driver.isIOS
      ? '//XCUIElementTypeOther[@name="Applitools_View"]'
      : driver.isAndroid
      ? '//android.widget.TextView[@content-desc="Applitools_View"]'
      : null
    if (!selector) return null
    const element = await driver.element({
      type: 'xpath',
      selector,
    })
    const result = JSON.parse(await element.getText())
    return result.nextPath
  } catch (error) {
    return null
  }
}
