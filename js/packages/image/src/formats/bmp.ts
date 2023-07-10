import type {ImageRaw} from '../types'
import type {Size} from '@applitools/utils'
import * as bmp from 'bmpimagejs'

export function isBmpBuffer(buffer: Buffer): boolean {
  return buffer.subarray(0, 2).toString('ascii') === 'BM'
}

export function extractBmpSize(buffer: Buffer): Size {
  return {width: buffer.readUInt32LE(18), height: buffer.readUInt32LE(22)}
}

export async function fromBmpBuffer(buffer: Buffer): Promise<ImageRaw> {
  const image = bmp.decode(buffer)
  return {data: Buffer.from(image.pixels), width: image.width, height: image.height}
}
