import {TestResultContainer} from '../types'

export function separateDuplicateResults(containers: TestResultContainer<'classic' | 'ufg'>[]) {
  const containerByBaselineId = new Map<string, TestResultContainer<'classic' | 'ufg'>>()
  const duplicates = [] as TestResultContainer<'classic' | 'ufg'>[]
  const possibleDuplicateContainers = containers.filter(container => !container.result?.keepIfDuplicate)
  for (const container of possibleDuplicateContainers) {
    const baselineId = container.result?.baselineId
    if (baselineId) {
      const containerForThisBaseline = containerByBaselineId.get(baselineId)
      if (containerForThisBaseline) {
        const startedAt1 = Date.parse(containerForThisBaseline.result!.startedAt as string)
        const startedAt2 = Date.parse(container.result!.startedAt as string)
        if (startedAt2 > startedAt1) {
          duplicates.push(containerForThisBaseline)
          containerByBaselineId.set(baselineId, container)
        } else {
          duplicates.push(container)
        }
      } else {
        containerByBaselineId.set(baselineId, container)
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
