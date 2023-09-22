import type {ImageBuffer, ImageRaw} from '../types'
import type {Size} from '@applitools/utils'
import * as bmp from 'bmpimagejs'

export function isBmpBuffer(buffer: ImageBuffer): boolean {
  return new TextDecoder('ascii').decode(buffer.subarray(0, 2)) === 'BM'
}

export function extractBmpSize(buffer: ImageBuffer): Size {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  return {width: view.getUint32(18, true), height: view.getUint32(22, true)}
}

export async function fromBmpBuffer(buffer: ImageBuffer): Promise<ImageRaw> {
  const image = bmp.decode(buffer)
  return {
    data: new Uint8Array(image.pixels.buffer, image.pixels.byteOffset, image.pixels.byteLength),
    width: image.width,
    height: image.height,
  }
}
