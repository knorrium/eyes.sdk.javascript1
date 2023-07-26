import {type Test} from '../framework.js'
import {mkdir, writeFile} from 'fs/promises'
import * as path from 'path'

export async function saveMeta(
  tests: Test[],
  {output = './meta.json', pascalize = true}: {output?: string; pascalize?: boolean} = {},
) {
  mkdir(path.dirname(output), {recursive: true})

  const meta = tests.reduce((meta, test) => {
    meta[pascalize ? test.key : test.name] = {
      isGeneric: true,
      name: test.group,
      variant: test.variant,
      skip: test.skip,
      skipEmit: test.skipEmit,
    }
    return meta
  }, {} as Record<string, any>)

  const filePath = path.resolve(output)
  await writeFile(filePath, JSON.stringify(meta, null, 2))
}
