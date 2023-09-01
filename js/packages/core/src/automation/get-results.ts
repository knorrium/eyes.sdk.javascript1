import type {Eyes, GetResultsSettings, TestResult} from '../ufg/types'
import {type Logger} from '@applitools/logger'
import {AbortError} from '../errors/abort-error'

type Options = {
  eyes: Eyes<any>
  logger: Logger
}

export function makeGetResults({eyes, logger: mainLogger}: Options) {
  return async function getResults({
    settings,
    logger = mainLogger,
  }: {
    settings?: GetResultsSettings
    logger?: Logger
  } = {}): Promise<TestResult[]> {
    logger = logger.extend(mainLogger)

    logger.log('Command "getResults" is called with settings', settings)

    return Promise.all(
      Array.from(eyes.storage.values(), async item => {
        try {
          const [eyes] = await Promise.all([item.eyes, ...item.jobs])
          const [result] = await eyes.getResults({settings, logger})
          return {...result, renderer: eyes.test.renderer}
        } catch (error: any) {
          if (error instanceof AbortError && error.info?.eyes) {
            logger.warn('Command "getResults" received an abort error during performing', settings)
            const [result] = await error.info.eyes.getResults({settings, logger})
            return {...result, renderer: error.info.renderer}
          }
          logger.fatal('Command "getResults" received an error during performing', settings)
          throw error
        }
      }),
    )
  }
}
