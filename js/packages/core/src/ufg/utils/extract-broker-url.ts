import {type Driver} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import * as utils from '@applitools/utils'

export async function extractBrokerUrl({
  driver,
  logger,
}: {
  driver: Driver<unknown, unknown, unknown, unknown>
  logger: Logger
}): Promise<string | null> {
  if (!driver.isNative) return null
  logger.log('Broker url extraction is started')
  const element = await driver.element({type: 'accessibility id', selector: 'Applitools_View'})
  if (!element) return null
  try {
    let result: {error: string; nextPath: string | null}
    do {
      result = JSON.parse(await element.getText())
      if (result.nextPath) {
        logger.log('Broker url was extraction finished successfully with value', result.nextPath)
        return result.nextPath
      }
      await utils.general.sleep(1000)
    } while (!result.error)
    logger.error('Broker url extraction has failed with error', result.error)
    return null
  } catch (error) {
    return null
  }
}
