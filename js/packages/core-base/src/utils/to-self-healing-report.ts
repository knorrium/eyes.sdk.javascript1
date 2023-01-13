import type {TestMetadata, SelfHealingReport} from '../types'

export function toSelfHealingReport(input: TestMetadata): SelfHealingReport {
  const result = {
    operations: [],
  }
  input.forEach(item => {
    const date = new Date()
    result.operations.push({
      old: item?.originalSelector,
      new: item?.successfulSelector,
      timestamp: date.toISOString(),
    })
  })
  return result
}
