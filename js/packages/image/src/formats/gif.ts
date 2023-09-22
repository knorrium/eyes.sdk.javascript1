import type {ImageBuffer, ImageRaw} from '../types'
import type {Size} from '@applitools/utils'
import * as gif from 'omggif'

export function isGifBuffer(buffer: ImageBuffer): boolean {
  return ['GIF87a', 'GIF89a'].includes(new TextDecoder('ascii').decode(buffer.subarray(0, 6)))
}

export function extractGifSize(buffer: ImageBuffer): Size {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  return {width: view.getUint16(6, true), height: view.getUint16(8, true)}
}

export async function fromGifBuffer(buffer: ImageBuffer): Promise<ImageRaw> {
  const reader = new gif.GifReader(buffer)
  const data = new Uint8Array(reader.width * reader.height * 4).fill(0)
  reader.decodeAndBlitFrameRGBA(0, data)
  return {width: reader.width, height: reader.height, data}
}

export async function freezeGif(buffer: ImageBuffer): Promise<ImageBuffer> {
  const reader = new gif.GifReader(buffer)
  if (reader.numFrames() === 0) return buffer
  const frame = reader.frameInfo(0)
  return buffer.subarray(0, frame.data_offset + frame.data_length)
}
