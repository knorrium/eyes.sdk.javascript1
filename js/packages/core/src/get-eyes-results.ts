import type {Eyes, GetEyesResultsSettings, TestResult} from './types'
import {type SpecType} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {TestError} from './errors/test-error'

type Options<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = {
  eyes: Eyes<TSpec, TType>
  logger: Logger
}

export function makeGetEyesResults<TSpec extends SpecType, TType extends 'classic' | 'ufg'>({
  eyes,
  logger: defaultLogger,
}: Options<TSpec, TType>) {
  return async function getEyesResults({
    settings,
    logger = defaultLogger,
  }: {
    settings?: GetEyesResultsSettings<TType>
    logger?: Logger
  } = {}): Promise<TestResult<TType>[]> {
    const typedEyes = await eyes.getTypedEyes({logger})
    const results = await typedEyes.getResults({settings, logger})
    if (settings?.throwErr) {
      results.forEach(result => {
        if (result.status !== 'Passed') throw new TestError(result)
      })
    }
    return results as TestResult<TType>[]
  }
}
