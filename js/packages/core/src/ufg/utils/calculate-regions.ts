import {generateSafeSelectors} from '../utils/generate-safe-selectors'
import type {SpecType, Driver, ElementReference} from '@applitools/driver'

export type CalculateRegionsOptions = {
  elementReferencesToCalculate: ElementReference<SpecType>[]
  elementReferenceToTarget?: ElementReference<SpecType>
  scrollRootElement?: ElementReference<SpecType>
}

export async function calculateRegions<TSpec extends SpecType>({
  driver,
  elementReferencesToCalculate,
  elementReferenceToTarget,
  scrollRootElement,
}: {
  driver: Driver<TSpec>
} & CalculateRegionsOptions) {
  const elementReferences = [
    ...(elementReferenceToTarget ? [elementReferenceToTarget] : []),
    ...(scrollRootElement ? [scrollRootElement] : []),
    ...elementReferencesToCalculate,
  ]

  const {cleanupGeneratedSelectors, selectors} = await generateSafeSelectors({
    context: driver.currentContext,
    elementReferences,
  })

  let selectorsToCalculate = selectors
  let regionToTarget
  let scrollRootSelector

  if (elementReferenceToTarget) {
    if (!selectorsToCalculate[0]?.safeSelector) throw new Error('Target element not found')
    regionToTarget = selectorsToCalculate[0].safeSelector
    selectorsToCalculate = selectorsToCalculate.slice(1)
  }
  if (scrollRootElement) {
    scrollRootSelector = selectorsToCalculate[0].safeSelector ?? undefined
    selectorsToCalculate = selectorsToCalculate.slice(1)
  }

  return {cleanupGeneratedSelectors, selectorsToCalculate, regionToTarget, scrollRootSelector}
}
