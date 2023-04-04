import {separateDuplicateResults} from '../../src/utils/separate-duplicate-results'
import assert from 'assert'
import {TestResultContainer} from '../../src/types'

describe('separate-duplicate-results', () => {
  it('returns deduped results and collection of tests to be deleted in eyes', () => {
    const results = [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 1',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:16.9972520+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 3',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:33:07.6889232+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
        },
      },
    ] as TestResultContainer<'classic' | 'ufg'>[]
    const [dedupedResults, testsToDelete] = separateDuplicateResults(results)
    assert.deepStrictEqual(dedupedResults, [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 1',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:16.9972520+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
        },
      },
    ])
    assert.deepStrictEqual(testsToDelete, [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 3',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:33:07.6889232+00:00',
          keepIfDuplicate: false,
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
          initializedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: '00000251723225742799',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
        },
      },
    ] as TestResultContainer<'classic' | 'ufg'>[]
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
          initializedAt: '2023-03-17T17:44:16.9972520+00:00',
        },
      },
      {
        result: {
          keepIfDuplicate: true,
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.6889232+00:00',
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
        },
      },
    ] as TestResultContainer<'classic' | 'ufg'>[]
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
          initializedAt: '2023-03-17T17:44:16.9972520+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 2',
          initializedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
        },
      },
    ] as TestResultContainer<'classic' | 'ufg'>[]
    const [dedupedResults, testsToDelete] = separateDuplicateResults(results)
    assert.deepStrictEqual(dedupedResults, [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 1',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:16.9972520+00:00',
          keepIfDuplicate: false,
        },
      },
      {
        result: {
          baselineId: 'baseline 2',
          id: 'test 3',
          batchId: 'batch 1',
          initializedAt: '2023-03-17T17:44:07.4545410+00:00',
          keepIfDuplicate: false,
        },
      },
    ])
    assert.deepStrictEqual(testsToDelete, [
      {
        result: {
          baselineId: 'baseline 1',
          id: 'test 2',
          batchId: 'batch 2',
          initializedAt: '2023-03-17T17:44:07.6889232+00:00',
          keepIfDuplicate: false,
        },
      },
    ])
  })
})
