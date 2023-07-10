import type {ImageRaw} from '../types'
import type {Size} from '@applitools/utils'
import stream from 'stream'
import * as png from 'png-async'

export function isPngBuffer(buffer: Buffer): boolean {
  return buffer.subarray(12, 16).toString('ascii') === 'IHDR'
}

export function extractPngSize(buffer: Buffer): Size {
  return {width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20)}
}

export async function fromPngBuffer(buffer: Buffer): Promise<ImageRaw> {
  return new Promise((resolve, reject) => {
    const image = new png.Image()

    image.parse(buffer, (err, image) => {
      if (err) return reject(err)
      resolve(image)
    })
  })
}

export async function toPng(image: ImageRaw): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let buffer = Buffer.alloc(0)

    const writable = new stream.Writable({
      write(chunk, _encoding, next) {
        buffer = Buffer.concat([buffer, chunk])
        next()
      },
    })

    const wrapper = new png.Image({width: image.width, height: image.height})
    wrapper.data = image.data
    wrapper
      .pack()
      .pipe(writable)
      .on('finish', () => resolve(buffer))
      .on('error', (err: Error) => reject(err))
  })
}
