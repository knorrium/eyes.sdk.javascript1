import type {ScreenshotSettings, Screenshot} from './types'
import {type Logger} from '@applitools/logger'
import {type NMLRequests} from './server/requests'

type Options = {
  requests: NMLRequests
  logger: Logger
}

export function makeTakeScreenshot({requests, logger: defaultLogger}: Options) {
  return async function takeScreenshot({
    settings,
    logger = defaultLogger,
  }: {
    settings: ScreenshotSettings
    logger?: Logger
  }): Promise<Screenshot> {
    return requests.takeScreenshot({settings, logger})
  }
}
