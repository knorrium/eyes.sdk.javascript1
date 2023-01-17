import {PassThrough, type Readable} from 'stream'
import * as general from './general'

export async function toBuffer(stream: Readable): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    let ended = false
    const chunks = [] as Buffer[]

    stream.on('data', onData)
    stream.on('end', onEnd)
    stream.on('error', onEnd)
    stream.on('aborted', onAbort)
    stream.on('pause', onPause)
    stream.on('close', onCleanup)

    function onData(chunk: Buffer) {
      chunks.push(chunk)
    }
    function onEnd(err: Error) {
      if (err) return reject(err)
      ended = true
      resolve(Buffer.concat(chunks))
    }
    function onAbort() {
      if (!ended) reject(new Error('Cannot collect message data due to it being closed before ended'))
    }
    function onPause() {
      stream.resume()
    }
    function onCleanup() {
      stream.off('data', onData)
      stream.off('end', onEnd)
      stream.off('error', onEnd)
      stream.off('aborted', onAbort)
      stream.off('pause', onPause)
      stream.off('close', onCleanup)
    }
  })
}

export async function toJSON(stream: Readable): Promise<any> {
  const buffer = await toBuffer(stream)
  return JSON.parse(buffer.toString('utf8'))
}

export function persist(stream: Readable): Readable {
  const clone = stream.pipe(new PassThrough())
  let buffer: Promise<Buffer>
  clone.pipe = general.wrap(clone.pipe.bind(clone) as typeof clone.pipe, (pipe, destination, options) => {
    if (!buffer) {
      buffer = toBuffer(clone)
      return pipe(destination, options)
    }
    buffer.then(buffer => {
      destination.write(buffer)
      if (options?.end !== false) destination.end()
    })
    return destination
  })
  return clone
}
