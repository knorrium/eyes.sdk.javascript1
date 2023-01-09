export default function addKeyToDuplicatedValuesInArray<TValue extends {id?: string}>(array: TValue[]): TValue[] {
  const result = [] as TValue[]
  const duplicates = new Map<string, number>()
  for (const value of array) {
    let index = 0
    const key = JSON.stringify(value)
    if (duplicates.has(key)) {
      index = duplicates.get(key) + 1
      result.push({...value, id: `${typeof value.id !== 'undefined' ? value.id + '-' : ''}${index}`})
    } else {
      result.push(value)
    }
    duplicates.set(key, index)
  }
  return result
}
