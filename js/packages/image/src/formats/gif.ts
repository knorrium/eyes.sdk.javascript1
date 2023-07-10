import type {ImageRaw} from '../types'
import type {Size} from '@applitools/utils'
import * as gif from 'omggif'

export function isGifBuffer(buffer: Buffer): boolean {
  return ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))
}

export function extractGifSize(buffer: Buffer): Size {
  return {width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8)}
}

export async function fromGifBuffer(buffer: Buffer): Promise<ImageRaw> {
  const reader = new gif.GifReader(buffer)
  const data = Buffer.alloc(reader.width * reader.height * 4)
  reader.decodeAndBlitFrameRGBA(0, data)
  return {width: reader.width, height: reader.height, data}
}

export async function freezeGif(input: Buffer): Promise<Buffer> {
  const reader = new gif.GifReader(input)
  if (reader.numFrames() === 0) return input
  const frame = reader.frameInfo(0)
  return input.subarray(0, frame.data_offset + frame.data_length)
}
