import type {Handler, FileHandler} from './types'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

export function makeFileHandler({
  filename = process.env.APPLITOOLS_LOG_FILE ?? 'eyes.log',
  append = true,
}: Omit<FileHandler, 'type'> = {}): Handler {
  let writer = null as fs.WriteStream | null

  return {log, open, close}

  function open() {
    const filepath = path.normalize(filename)
    ensureDirectoryExistence(filepath)
    writer = fs.createWriteStream(filepath, {flags: append ? 'a' : 'w', encoding: 'utf8'})
  }
  function close() {
    if (!writer) return
    writer.end()
    writer = null
  }
  function log(message: string) {
    if (!writer) open()
    writer!.write(message + os.EOL)
  }
}

function ensureDirectoryExistence(filename: string) {
  const dirname = path.dirname(filename)
  fs.mkdirSync(dirname, {recursive: true})
}
