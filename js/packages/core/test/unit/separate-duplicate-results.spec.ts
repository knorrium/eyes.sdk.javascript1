import {separateDuplicateResults} from '../../src/utils/separate-duplicate-results'
import assert from 'assert'
import {TestResultContainer} from '../../src/types'

const server = {serverUrl: '', apiKey: ''}

describe('separate-duplicate-results', () => {
  it('returns deduped results and collection of tests to be deleted in eyes', () => {
    const results: TestResultContainer<'classic' | 'ufg'>[] = [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 1',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:16.9972520+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 3',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:33:07.6889232+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
    ]
    const [dedupedResults, testsToDelete] = separateDuplicateResults(results)
    assert.deepStrictEqual(dedupedResults, [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 1',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:16.9972520+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
    ])
    assert.deepStrictEqual(testsToDelete, [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 3',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:33:07.6889232+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
    ])
  })

  it('does nothing when no dupes found', () => {
    const results: TestResultContainer<'classic' | 'ufg'>[] = [
      {
        result: {
          baselineId: 'baseline 1',
          id: '00000251723225752154',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: '00000251723225742799',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
    ]
    const [dedupedResults, testsToDelete] = separateDuplicateResults(results)
    assert.deepStrictEqual(dedupedResults, results)
    assert.deepStrictEqual(testsToDelete, [])
  })

  it('keeps duplicates when result has `keepIfDuplicate` property', () => {
    const results: TestResultContainer<'classic' | 'ufg'>[] = [
      {
        result: {
          keepIfDuplicate: true,
          baselineId: 'baseline 1',
          id: 'test 1',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:16.9972520+00:00',
          server,
        },
      },
      {
        result: {
          keepIfDuplicate: true,
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.6889232+00:00',
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
    ]
    const [dedupedResults, testsToDelete] = separateDuplicateResults(results)
    assert.deepStrictEqual(dedupedResults, results)
    assert.deepStrictEqual(testsToDelete, [])
  })

  it('removes duplicates across different batches', () => {
    const results: TestResultContainer<'classic' | 'ufg'>[] = [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 1',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:16.9972520+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 2',
          startedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
    ]
    const [dedupedResults, testsToDelete] = separateDuplicateResults(results)
    assert.deepStrictEqual(dedupedResults, [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 1',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:16.9972520+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          startedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
    ])
    assert.deepStrictEqual(testsToDelete, [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 2',
          startedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
          server,
        },
      },
    ])
  })
})
