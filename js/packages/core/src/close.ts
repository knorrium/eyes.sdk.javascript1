import type {Eyes, Config, CloseSettings, TestResult} from './types'
import {type Logger} from '@applitools/logger'
import {TestError} from './errors/test-error'

type Options<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg'> = {
  eyes: Eyes<TDriver, TContext, TElement, TSelector, TType>
  logger: Logger
}

export function makeClose<TDriver, TContext, TElement, TSelector, TType extends 'classic' | 'ufg'>({
  eyes,
  logger: defaultLogger,
}: Options<TDriver, TContext, TElement, TSelector, TType>) {
  return async function close({
    settings,
    config,
    logger = defaultLogger,
  }: {
    settings?: CloseSettings<TType>
    config?: Config<TElement, TSelector, TType>
    logger?: Logger
  } = {}): Promise<TestResult<TType>[]> {
    settings = {...config?.close, ...settings}
    settings.updateBaselineIfNew ??= true
    const typedEyes = await eyes.getTypedEyes({logger})
    const results = await typedEyes.close({settings, logger})
    if (settings.throwErr) {
      results.forEach(result => {
        if (result.status !== 'Passed') throw new TestError(result)
      })
    }
    return results.length > 0
      ? results
      : [
          {
            userTestId: eyes.test.userTestId,
            name: '',
            steps: 0,
            matches: 0,
            mismatches: 0,
            missing: 0,
            exactMatches: 0,
            strictMatches: 0,
            contentMatches: 0,
            layoutMatches: 0,
            noneMatches: 0,
          },
        ]
  }
}
