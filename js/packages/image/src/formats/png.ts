import type {ImageBuffer, ImageRaw} from '../types'
import type {Size} from '@applitools/utils'
import * as png from 'png-async'
import * as utils from '@applitools/utils'

export function isPngBuffer(buffer: ImageBuffer): boolean {
  return new TextDecoder('ascii').decode(buffer.subarray(12, 16)) === 'IHDR'
}

export function extractPngSize(buffer: ImageBuffer): Size {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  return {width: view.getUint32(16), height: view.getUint32(20)}
}

export async function fromPngBuffer(buffer: ImageBuffer): Promise<ImageRaw> {
  return new Promise((resolve, reject) => {
    const image = new png.Image()

    image.parse(Buffer.from(buffer), (err, image) => {
      if (err) return reject(err)
      resolve(image)
    })
  })
}

export async function toPng(image: ImageRaw): Promise<ImageBuffer> {
  const wrapper = new png.Image({width: image.width, height: image.height})
  wrapper.data = Buffer.from(image.data)
  return utils.streams.toBuffer(wrapper.pack())
}
