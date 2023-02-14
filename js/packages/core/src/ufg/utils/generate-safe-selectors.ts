import {type SpecType, type Context, type Element, type ElementReference, type CommonSelector} from '@applitools/driver'
import * as utils from '@applitools/utils'

const {addElementIds, cleanupElementIds} = require('@applitools/snippets')

export async function generateSafeSelectors<TSpec extends SpecType>({
  context,
  elementReferences,
}: {
  context: Context<TSpec>
  elementReferences: ElementReference<TSpec>[]
}) {
  const mapping = {
    elements: [] as Element<TSpec>[][],
    ids: [] as string[][],
  }

  for (const elementReference of elementReferences) {
    const elements = await context.elements(elementReference)
    mapping.elements.push(elements)
    mapping.ids.push(Array(elements.length).fill(utils.general.guid()))
  }

  const generatedSelectors: [string, ...string[]][] = await context.execute(addElementIds, [
    mapping.elements.flat(),
    mapping.ids.flat(),
  ])
  let offset = 0
  const selectors = mapping.elements.map((elements, index) => {
    if (elements.length === 0)
      return {safeSelector: null, originalSelector: null, elementReference: elementReferences[index]}
    const safeSelector = generatedSelectors[offset].reduceRight<CommonSelector>((selector, value) => {
      return selector ? {type: 'css', selector: value, shadow: selector} : {type: 'css', selector: value}
    }, undefined as never)
    offset += elements.length
    return {safeSelector, originalSelector: elements[0].commonSelector, elementReference: elementReferences[index]}
  })

  return {
    selectors,
    cleanupGeneratedSelectors,
  }

  async function cleanupGeneratedSelectors() {
    if (!mapping.elements.length) return
    await context.execute(cleanupElementIds, [mapping.elements.flat()])
  }
}
