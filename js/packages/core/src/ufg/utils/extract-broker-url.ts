import {type Driver} from '@applitools/driver'
import * as utils from '@applitools/utils'

export async function extractBrokerUrl({
  driver,
}: {
  driver: Driver<unknown, unknown, unknown, unknown>
}): Promise<string | null> {
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
    if (!element) return null
    const result = JSON.parse(await element.getText())
    if (result.nextPath) return result.nextPath
    if (!result.error) {
      const attempts = Array.from(Array(60).keys())
      for (const _attempt of attempts) {
        await utils.general.sleep(500)
        const result = JSON.parse(await element.getText())
        if (result.nextPath) return result.nextPath
      }
    }
  } catch (error) {
    return null
  }
}
