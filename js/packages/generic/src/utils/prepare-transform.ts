import type {Test, Override} from '../framework.js'
import type {MaybeArray} from '@applitools/utils'
import {merge} from './merge.js'
import * as utils from '@applitools/utils'

export async function prepareTransform(
  overrides?: MaybeArray<string | Override>,
  parentUrl?: string,
): Promise<(test: Test) => Test> {
  if (!overrides) {
    return test => test
  } else if (utils.types.isString(overrides)) {
    const overrideUrl = await import.meta.resolve!(overrides, parentUrl)
    return prepareTransform((await import(overrideUrl)).overrides, overrideUrl)
  } else if (utils.types.isArray(overrides)) {
    return overrides.reduce(
      async (promise, item) => {
        const override = await prepareTransform(item, parentUrl)
        return promise.then(baseOverride => test => override(baseOverride(test)))
      },
      Promise.resolve((test: Test) => test),
    )
  } else if (utils.types.isFunction(overrides)) {
    return test => merge(test, overrides(test) ?? {})
  } else {
    return test => (utils.types.has(overrides, test.name) ? merge(test, overrides[test.name]) : test)
  }
}
