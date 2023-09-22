import type {ImageBuffer, ImageRaw} from '../types'
import type {Size} from '@applitools/utils'
import * as jpeg from 'jpeg-js'

export function isJpegBuffer(buffer: ImageBuffer): boolean {
  return ['JFIF', 'Exif'].includes(new TextDecoder('ascii').decode(buffer.subarray(6, 10)))
}

export function extractJpegSize(buffer: ImageBuffer): Size {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  // skip file signature
  let offset = 4
  while (view.byteLength > offset) {
    // extract length of the block
    offset += view.getUint16(offset)
    // if next segment is SOF0 or SOF2 extract size
    if (view.getUint8(offset + 1) === 0xc0 || view.getUint8(offset + 1) === 0xc2) {
      return {width: view.getUint16(offset + 7), height: view.getUint16(offset + 5)}
    } else {
      // skip block signature
      offset += 2
    }
  }
  return {width: 0, height: 0}
}

export async function fromJpegBuffer(buffer: ImageBuffer): Promise<ImageRaw> {
  return jpeg.decode(buffer, {tolerantDecoding: true, formatAsRGBA: true})
}
