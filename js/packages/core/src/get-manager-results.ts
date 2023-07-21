import type {
  Core,
  Eyes,
  GetManagerResultsSettings,
  CloseBatchSettings,
  TestResult,
  TestResultContainer,
  TestResultSummary,
} from './types'
import {type SpecType} from '@applitools/driver'
import {type Logger} from '@applitools/logger'
import {TestError} from './errors/test-error'
import {InternalError} from './errors/internal-error'
import {separateDuplicateResults} from './utils/separate-duplicate-results'
import * as utils from '@applitools/utils'

type Options<TSpec extends SpecType, TType extends 'classic' | 'ufg'> = {
  core: Core<TSpec>
  storage: Eyes<TSpec, TType>[]
  logger: Logger
}

export function makeGetManagerResults<TSpec extends SpecType, TType extends 'classic' | 'ufg'>({
  core,
  storage,
  logger: mainLogger,
}: Options<TSpec, TType>) {
  return async function getManagerResults({
    settings,
    logger = mainLogger,
  }: {
    settings?: GetManagerResultsSettings<TType>
    logger?: Logger
  } = {}): Promise<TestResultSummary<TType>> {
    logger = logger.extend(mainLogger, {tags: [`get-manager-results-${utils.general.shortid()}`]})

    let containers = await storage.reduce(async (promise, eyes) => {
      try {
        const results = await eyes.getResults({settings: {...settings, throwErr: false}, logger})
        return promise.then(containers => {
          return containers.concat(
            results.map(result => ({
              result,
              error: result.status !== 'Passed' ? new TestError(result) : undefined,
              userTestId: result.userTestId,
              renderer: (result as TestResult<'ufg'>).renderer as any,
            })),
          )
        })
      } catch (error: any) {
        return promise.then(containers => containers.concat({error: new InternalError(error), ...error.info}))
      }
    }, Promise.resolve([] as TestResultContainer<TType>[]))

    if (settings?.removeDuplicateTests) {
      logger.log('User opted into removing duplicate tests, checking for duplicates...')
      const [dedupedContainers, duplicateContainers] = separateDuplicateResults(containers)
      containers = dedupedContainers
      if (!duplicateContainers.length) logger.log('No duplicate tests found.')
      else {
        await Promise.all(
          duplicateContainers.map(async container => {
            if (container.result) {
              await core.deleteTest({
                settings: {
                  ...container.result.eyesServer,
                  testId: container.result.id,
                  batchId: container.result.batchId,
                  secretToken: container.result.secretToken,
                },
              })
            }
          }),
        )
        logger.log('Done cleaning up duplicate tests!')
      }
    }

    const batches = storage.reduce((batches, eyes) => {
      if (!eyes.test.keepBatchOpen) {
        const settings = {...eyes.test.eyesServer, batchId: eyes.test.batchId}
        batches[`${settings.eyesServerUrl}:${settings.apiKey}:${settings.batchId}`] = settings
      }
      return batches
    }, {} as Record<string, CloseBatchSettings>)

    await core.closeBatch({settings: Object.values(batches), logger}).catch(() => null)

    const summary = {
      results: containers,
      passed: 0,
      unresolved: 0,
      failed: 0,
      exceptions: 0,
      mismatches: 0,
      missing: 0,
      matches: 0,
    }

    for (const container of summary.results) {
      if (container.error) {
        if (settings?.throwErr) throw container.error
        summary.exceptions += 1
      }

      if (container.result) {
        if (container.result.status === 'Failed') summary.failed += 1
        else if (container.result.status === 'Passed') summary.passed += 1
        else if (container.result.status === 'Unresolved') summary.unresolved += 1

        summary.matches += container.result.matches ?? 0
        summary.missing += container.result.missing ?? 0
        summary.mismatches += container.result.mismatches ?? 0
      }
    }

    return summary
  }
}
