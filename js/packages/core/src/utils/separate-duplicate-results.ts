import {TestResultContainer} from '../types'

export function separateDuplicateResults(containers: TestResultContainer<'classic' | 'ufg'>[]) {
  const containerByBaselineId = new Map<string, TestResultContainer<'classic' | 'ufg'>>()
  const duplicates = [] as TestResultContainer<'classic' | 'ufg'>[]
  const possibleDuplicateContainers = containers.filter(container => !container.result?.keepIfDuplicate)
  for (const container of possibleDuplicateContainers) {
    if (container.result) {
      const containerForThisBaseline = containerByBaselineId.get(container.result.baselineId)
      if (containerForThisBaseline?.result) {
        const initializedAt1 = Date.parse(containerForThisBaseline.result.initializedAt)
        const initializedAt2 = Date.parse(container.result.initializedAt)
        if (initializedAt2 > initializedAt1) {
          duplicates.push(containerForThisBaseline)
          containerByBaselineId.set(container.result.baselineId, container)
        } else {
          duplicates.push(container)
        }
      } else {
        containerByBaselineId.set(container.result.baselineId, container)
      }
    }
  }

  return [
    // tests to keep
    !duplicates.length ? containers : containers.filter(container => !duplicates.includes(container)),
    // tests to delete
    duplicates,
  ]
}
