import zip from 'jszip'
import * as os from 'os'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as utils from '@applitools/utils'

export async function downloadFixtures(urlOrPath: string): Promise<string> {
  if (!utils.types.isHttpUrl(urlOrPath)) return urlOrPath

  const zipBuffer = await fetch(urlOrPath).then(async response => new Uint8Array(await response.arrayBuffer()))
  const content = await zip.loadAsync(zipBuffer, {createFolders: true})

  const fixturesPath = path.resolve(os.homedir(), '.applitools', 'fixtures')
  await fs.mkdir(fixturesPath, {recursive: true})
  for (const [filename, info] of Object.entries(content.files)) {
    const fullPath = path.join(fixturesPath, filename)
    if (info.dir) await fs.mkdir(fullPath, {recursive: true})
    else await fs.writeFile(fullPath, await content.file(filename)!.async('nodebuffer'))
  }
  return fixturesPath
}
