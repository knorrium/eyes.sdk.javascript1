import * as utils from '@applitools/utils'

export function merge<TBase extends Record<string, any>>(base: TBase, other: Record<string, any>): TBase {
  return Object.entries(other).reduce(
    (base, [key, value]: [keyof TBase, any]) => {
      if (
        utils.types.has(base, key) &&
        utils.types.isObject(value) &&
        !(value instanceof String) &&
        !utils.types.isArray(value)
      ) {
        base[key] = merge(base[key], value)
      } else if (value !== undefined) {
        base[key] = value
      }
      return base
    },
    {...base},
  )
}
