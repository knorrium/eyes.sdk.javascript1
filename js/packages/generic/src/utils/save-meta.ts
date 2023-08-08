import {type Test} from '../framework.js'
import {mkdir, writeFile} from 'fs/promises'
import * as path from 'path'

export async function saveMeta(
  tests: Test[],
  {
    output = './meta.json',
    pascalize,
    params,
  }: {output?: string; pascalize?: boolean; params?: Record<string, any>} = {},
) {
  const filePath = path.resolve(output)

  await mkdir(path.dirname(filePath), {recursive: true})

  const meta = tests.reduce((meta, test) => {
    meta[pascalize ? test.key : test.name] = {
      name: test.group,
      params: {...params, variant: test.variant},
      generic: true,
      skip: test.skipEmit || test.skip,
      reason: test.reason,
    }
    return meta
  }, {} as Record<string, any>)

  await writeFile(filePath, JSON.stringify(meta, null, 2))
}
