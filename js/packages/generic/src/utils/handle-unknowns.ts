export function handleUnknowns<TObject extends Record<any, any>>(
  object: TObject,
  options: {message: (name: string) => string},
): TObject {
  return new Proxy(object, {
    get(target, name: string) {
      if (name in target) {
        return Reflect.get(target, name)
      } else {
        throw new Error(options.message(name))
      }
    },
  })
}
