import type {GetResultsSettings, TestResult} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests} from './server/requests'

type Options = {
  requests: EyesRequests
  logger: Logger
}

export function makeGetResults({requests, logger: defaultLogger}: Options) {
  return async function getResults({
    settings,
    logger = defaultLogger,
  }: {
    settings?: GetResultsSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    logger.log('Command "getResults" is called with settings', settings)
    return requests.getResults({settings, logger})
  }
}
