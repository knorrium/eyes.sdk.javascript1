import type {GetResultsSettings, TestResult} from './types'
import {type Logger} from '@applitools/logger'
import {type EyesRequests, type FunctionalSessionRequests} from './server/requests'
import * as utils from '@applitools/utils'

type Options = {
  requests: EyesRequests | FunctionalSessionRequests
  logger: Logger
}

export function makeGetResults({requests, logger: mainLogger}: Options) {
  return async function getResults({
    settings,
    logger = mainLogger,
  }: {
    settings?: GetResultsSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    logger = logger.extend(mainLogger, {tags: [`get-results-base-${utils.general.shortid()}`]})

    logger.log('Command "getResults" is called with settings', settings)
    return requests.getResults({settings, logger})
  }
}
