import type {ImageRaw} from '../types'
import type {Size} from '@applitools/utils'
import * as jpeg from 'jpeg-js'

export function isJpegBuffer(buffer: Buffer): boolean {
  return ['JFIF', 'Exif'].includes(buffer.subarray(6, 10).toString('ascii'))
}

export function extractJpegSize(buffer: Buffer): Size {
  // skip file signature
  let offset = 4
  while (buffer.length > offset) {
    // extract length of the block
    offset += buffer.readUInt16BE(offset)
    // if next segment is SOF0 or SOF2 extract size
    if (buffer[offset + 1] === 0xc0 || buffer[offset + 1] === 0xc2) {
      return {width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5)}
    } else {
      // skip block signature
      offset += 2
    }
  }
  return {width: 0, height: 0}
}

export async function fromJpegBuffer(buffer: Buffer): Promise<ImageRaw> {
  return jpeg.decode(buffer, {tolerantDecoding: true, formatAsRGBA: true})
}
