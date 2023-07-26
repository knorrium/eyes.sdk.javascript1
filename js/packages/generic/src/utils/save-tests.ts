import {type Test} from '../framework.js'
import {rm, mkdir, writeFile} from 'fs/promises'
import * as prettier from 'prettier'
import * as path from 'path'

export async function saveTests(tests: Test[], {output, format}: {output: string; format?: any}) {
  const pathTemplate = path.resolve(process.cwd(), output)

  await rm(path.dirname(pathTemplate), {force: true, recursive: true})
  await mkdir(path.dirname(pathTemplate), {recursive: true})

  await Promise.all(
    tests.map(async test =>
      writeFile(
        pathTemplate.replace('{{test-key}}', test.key),
        format ? await prettier.format(test.code, format) : test.code,
      ),
    ),
  )
}
