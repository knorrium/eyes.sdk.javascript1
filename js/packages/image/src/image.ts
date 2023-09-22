import type {ImageBuffer, ImageRaw} from './types'
import type {Location, Size, Region} from '@applitools/utils'
import {isPngBuffer, extractPngSize, fromPngBuffer, toPng} from './formats/png'
import {isJpegBuffer, extractJpegSize, fromJpegBuffer} from './formats/jpeg'
import {isBmpBuffer, extractBmpSize, fromBmpBuffer} from './formats/bmp'
import {isGifBuffer, extractGifSize, fromGifBuffer} from './formats/gif'
import fs from 'fs'
import path from 'path'
import * as utils from '@applitools/utils'

export interface Image {
  isImage: true
  size: Size
  unscaledSize: Size
  rawSize: Size
  transforms: Transforms
  width: number
  height: number
  scale(ratio: number): Image
  rotate(degrees: number): Image
  crop(region: any): Image
  copy(srcImage: Image, offset: any): Image
  frame(topImage: Image, bottomImage: Image, region: any): Image
  toRaw(): Promise<ImageRaw>
  toBuffer(): Promise<ImageBuffer>
  toPng(): Promise<ImageBuffer>
  toFile(path: string): Promise<void>
  toObject(): Promise<ImageRaw>
  debug(debug: any): Promise<void>
}

type ImageSource = string | ArrayBuffer | ImageBuffer | Image | (Size & {data?: ImageBuffer}) | {auto: true}

type Transforms = {
  rotate: number
  scale: number
  crop?: Region
  modifiers: (
    | {type: 'copy'; image: Promise<ImageRaw>; offset: Location}
    | {type: 'frame'; top: Promise<ImageRaw>; bottom: Promise<ImageRaw>; region: Region}
  )[]
  added?: any
}

export function makeImage(data: ImageSource): Image {
  let image: ImageRaw | Promise<ImageRaw>, size: Size
  let transforms: Transforms = {rotate: 0, scale: 1, crop: undefined, modifiers: []}

  if (utils.types.isUint8Array(data) || utils.types.isAnyArrayBuffer(data)) {
    const buffer = utils.types.isAnyArrayBuffer(data) ? new Uint8Array(data) : data
    if (isPngBuffer(buffer)) {
      image = fromPngBuffer(buffer)
      size = extractPngSize(buffer)
    } else if (isJpegBuffer(buffer)) {
      image = fromJpegBuffer(buffer)
      size = extractJpegSize(buffer)
    } else if (isBmpBuffer(buffer)) {
      image = fromBmpBuffer(buffer)
      size = extractBmpSize(buffer)
    } else if (isGifBuffer(buffer)) {
      image = fromGifBuffer(buffer)
      size = extractGifSize(buffer)
    } else {
      throw new Error('Unable to create an image abstraction from buffer with unknown data')
    }
  } else if (utils.types.isBase64(data)) {
    return makeImage(Buffer.from(data, 'base64'))
  } else if (utils.types.isString(data)) {
    return makeImage(fs.readFileSync(data))
  } else if (utils.types.has(data, 'isImage')) {
    transforms = data.transforms
    image = data.toRaw()
    size = data.rawSize
  } else if (utils.types.has(data, ['width', 'height'])) {
    image = fromSize(data)
    if (utils.types.has(data, 'data') && data.data) image.data = data.data
    size = {width: data.width, height: data.height}
  } else if (data.auto) {
    size = {width: -1, height: -1}
  } else {
    throw new Error('Unable to create an image abstraction from unknown data')
  }

  return {
    get isImage() {
      return true as const
    },
    get size() {
      const croppedSize = utils.geometry.size(transforms.crop ?? size)
      const scaledSize = utils.geometry.scale(croppedSize, transforms.scale)
      const rotatedSize = utils.geometry.rotate(scaledSize, transforms.rotate)
      return utils.geometry.ceil(rotatedSize)
    },
    get unscaledSize() {
      const croppedSize = utils.geometry.size(transforms.crop ?? size)
      const rotatedSize = utils.geometry.rotate(croppedSize, transforms.rotate)
      return utils.geometry.ceil(rotatedSize)
    },
    get rawSize() {
      return size
    },
    get transforms() {
      return {...transforms}
    },
    get width() {
      return this.size.width
    },
    get height() {
      return this.size.height
    },
    scale(ratio) {
      transforms.scale *= ratio
      return this
    },
    rotate(degrees) {
      transforms.rotate = (transforms.rotate + degrees) % 360
      return this
    },
    crop(region) {
      if (utils.types.has(region, ['left', 'right', 'top', 'bottom'])) {
        region = {
          x: (region.left as number) / transforms.scale,
          y: (region.top as number) / transforms.scale,
          width: size.width - ((region.left as any) + region.right) / transforms.scale,
          height: size.height - ((region.top as any) + region.bottom) / transforms.scale,
        }
      } else {
        region = utils.geometry.scale(region, 1 / transforms.scale)
      }
      region = utils.geometry.rotate(region, -transforms.rotate, utils.geometry.rotate(size, transforms.rotate))
      region = transforms.crop
        ? utils.geometry.intersect(transforms.crop, utils.geometry.offset(region, transforms.crop))
        : utils.geometry.intersect({x: 0, y: 0, ...size}, region)
      transforms.crop = region
      size = utils.geometry.size(region)
      return this
    },
    copy(srcImage, offset) {
      // if "auto" image and this is first chunk
      if (!image && size.width === -1 && size.height === -1) transforms.scale = srcImage.transforms.scale

      const unscaledOffset = utils.geometry.scale(offset, 1 / transforms.scale)

      if (!image) {
        size = {
          width: Math.max(Math.floor(unscaledOffset.x) + srcImage.unscaledSize.width, size.width),
          height: Math.max(Math.floor(unscaledOffset.y) + srcImage.unscaledSize.height, size.height),
        }
      }

      const unscale =
        srcImage.transforms.scale === transforms.scale
          ? 1 / srcImage.transforms.scale
          : srcImage.transforms.scale / transforms.scale

      transforms.modifiers.push({type: 'copy', image: srcImage.scale(unscale).toObject(), offset: unscaledOffset})

      return this
    },
    frame(topImage, bottomImage, region) {
      const prevSize = size
      const unscaledRegion = utils.geometry.scale(region, 1 / topImage.transforms.scale)
      size = {
        width: Math.floor(topImage.unscaledSize.width + Math.max(size.width - unscaledRegion.width, 0)),
        height: Math.floor(topImage.unscaledSize.height + Math.max(size.height - unscaledRegion.height, 0)),
      }

      const unscale =
        topImage.transforms.scale === transforms.scale
          ? 1 / topImage.transforms.scale
          : topImage.transforms.scale / transforms.scale
      transforms.modifiers.push({
        type: 'frame',
        top: topImage.scale(unscale).toObject(),
        bottom: bottomImage.scale(unscale).toObject(),
        region: unscaledRegion,
      })
      transforms.added = {width: size.width - prevSize.width, height: size.height - prevSize.height}
      return this
    },
    async toRaw() {
      return image
    },
    async toBuffer() {
      const image = await this.toObject()
      return image.data
    },
    async toPng() {
      return toPng(await this.toObject())
    },
    async toFile(path) {
      return toFile(await image, path)
    },
    async toObject() {
      image = await transform(image ? await image : size, transforms)
      size = {width: image.width, height: image.height}
      transforms = {crop: undefined, scale: 1, rotate: 0, modifiers: []}
      return image
    },
    async debug(debug) {
      if (!debug || !debug.path) return
      const timestamp = new Date().toISOString().replace(/[-T:.]/g, '_')
      const filename = ['screenshot', timestamp, debug.name, debug.suffix].filter(part => part).join('_') + '.png'
      const transformedImage = await transform(image ? await image : size, transforms)
      return toFile(transformedImage, path.join(debug.path, filename)).catch(() => undefined)
    },
  }
}

function fromSize(size: Size): ImageRaw {
  return {...size, data: new Uint8Array(4 * size.width * size.height)}
}

async function toFile(image: ImageRaw, filepath: string): Promise<void> {
  const buffer = await toPng(image)
  return new Promise<void>((resolve, reject) => {
    fs.mkdirSync(path.dirname(filepath), {recursive: true})
    fs.writeFile(filepath, buffer, err => (err ? reject(err) : resolve()))
  })
}

async function transform(imageOrSize: ImageRaw | Size, transforms: Transforms): Promise<ImageRaw> {
  let image: ImageRaw
  if (utils.types.has(imageOrSize, 'data')) {
    image = imageOrSize
  } else {
    const size = transforms.added
      ? {width: imageOrSize.width - transforms.added.width, height: imageOrSize.height - transforms.added.height}
      : imageOrSize
    image = fromSize(size)
  }

  image = await transforms.modifiers.reduce(async (image, modifier) => {
    if (modifier.type === 'copy') {
      return copy(await image, await modifier.image, modifier.offset)
    } else if (modifier.type === 'frame') {
      return frame(await modifier.top, await modifier.bottom, await image, modifier.region)
    } else {
      return image
    }
  }, Promise.resolve(image))

  image = transforms.crop ? await extract(image, transforms.crop) : image
  image = transforms.scale !== 1 ? await scale(image, transforms.scale) : image
  image = transforms.rotate !== 0 ? await rotate(image, transforms.rotate) : image
  return image
}

async function scale(image: ImageRaw, scaleRatio: number): Promise<ImageRaw> {
  if (scaleRatio === 1) return image

  const ratio = image.height / image.width
  const scaledWidth = Math.ceil(image.width * scaleRatio)
  const scaledHeight = Math.ceil(scaledWidth * ratio)
  return resize(image, {width: scaledWidth, height: scaledHeight})
}

async function resize(image: ImageRaw, size: Size): Promise<ImageRaw> {
  const dst = fromSize(size)

  if (dst.width > image.width || dst.height > image.height) {
    _doBicubicInterpolation(image, dst)
  } else {
    _scaleImageIncrementally(image, dst)
  }

  image.data = dst.data
  image.width = dst.width
  image.height = dst.height

  return image
}

async function extract(image: ImageRaw, region: Region): Promise<ImageRaw> {
  const srcX = Math.max(0, Math.round(region.x))
  const srcY = Math.max(0, Math.round(region.y))
  const dstWidth = Math.round(Math.min(image.width - srcX, region.width))
  const dstHeight = Math.round(Math.min(image.height - srcY, region.height))
  const dstSize = {width: dstWidth, height: dstHeight}

  if (utils.geometry.isEmpty(dstSize)) {
    throw new Error(`Cannot extract empty region (${srcX};${srcY})${dstWidth}x${dstHeight} from image`)
  }

  const extracted = fromSize(dstSize)

  if (srcX === 0 && dstWidth === image.width) {
    const srcOffset = srcY * image.width * 4
    const dstLength = dstWidth * dstHeight * 4
    extracted.data.set(image.data.subarray(srcOffset, srcOffset + dstLength))
  } else {
    const chunkLength = dstWidth * 4
    for (let chunk = 0; chunk < dstHeight; ++chunk) {
      const srcOffset = ((srcY + chunk) * image.width + srcX) * 4
      extracted.data.set(image.data.subarray(srcOffset, srcOffset + chunkLength), chunk * chunkLength)
    }
  }

  return extracted
}

async function rotate(image: ImageRaw, degrees: number): Promise<ImageRaw> {
  degrees = (360 + degrees) % 360

  const dstImage = fromSize({width: image.width, height: image.height})
  const srcView = new DataView(image.data.buffer, image.data.byteOffset, image.data.byteLength)
  const dstView = new DataView(dstImage.data.buffer, dstImage.data.byteOffset, dstImage.data.byteLength)

  if (degrees === 90) {
    dstImage.width = image.height
    dstImage.height = image.width
    for (let srcY = 0, dstX = image.height - 1; srcY < image.height; ++srcY, --dstX) {
      for (let srcX = 0, dstY = 0; srcX < image.width; ++srcX, ++dstY) {
        const pixel = srcView.getUint32((srcY * image.width + srcX) * 4)
        dstView.setUint32((dstY * dstImage.width + dstX) * 4, pixel)
      }
    }
  } else if (degrees === 180) {
    dstImage.width = image.width
    dstImage.height = image.height
    for (let srcY = 0, dstY = image.height - 1; srcY < image.height; ++srcY, --dstY) {
      for (let srcX = 0, dstX = image.width - 1; srcX < image.width; ++srcX, --dstX) {
        const pixel = srcView.getUint32((srcY * image.width + srcX) * 4)
        dstView.setUint32((dstY * dstImage.width + dstX) * 4, pixel)
      }
    }
  } else if (degrees === 270) {
    dstImage.width = image.height
    dstImage.height = image.width
    for (let srcY = 0, dstX = 0; srcY < image.height; ++srcY, ++dstX) {
      for (let srcX = 0, dstY = image.width - 1; srcX < image.width; ++srcX, --dstY) {
        const pixel = srcView.getUint32((srcY * image.width + srcX) * 4)
        dstView.setUint32((dstY * dstImage.width + dstX) * 4, pixel)
      }
    }
  } else {
    dstImage.data.set(image.data)
  }

  return dstImage
}

async function copy(dstImage: ImageRaw, srcImage: ImageRaw, offset: Location): Promise<ImageRaw> {
  const dstX = Math.round(offset.x)
  const dstY = Math.round(offset.y)
  const srcWidth = Math.min(srcImage.width, dstImage.width - dstX)
  const srcHeight = Math.min(srcImage.height, dstImage.height - dstY)

  if (dstX === 0 && srcWidth === dstImage.width && srcWidth === srcImage.width) {
    const dstOffset = dstY * dstImage.width * 4
    dstImage.data.set(srcImage.data.subarray(0, srcWidth * srcHeight * 4), dstOffset)
    return dstImage
  }

  const chunkLength = srcWidth * 4
  for (let chunk = 0; chunk < srcHeight; ++chunk) {
    const srcOffset = chunk * srcImage.width * 4
    const dstOffset = ((dstY + chunk) * dstImage.width + dstX) * 4
    if (dstOffset >= 0) {
      dstImage.data.set(srcImage.data.subarray(srcOffset, srcOffset + chunkLength), dstOffset)
    }
  }

  return dstImage
}

async function frame(topImage: ImageRaw, bottomImage: ImageRaw, srcImage: ImageRaw, region: Region): Promise<ImageRaw> {
  region = utils.geometry.intersect(
    {x: 0, y: 0, width: topImage.width, height: topImage.height},
    utils.geometry.round(region),
  )

  if (region.x === 0 && region.y === 0 && region.width >= topImage.width && region.height >= topImage.height) {
    return srcImage
  }

  if (region.width >= srcImage.width && region.height >= srcImage.height) {
    await copy(topImage, srcImage, {x: region.x, y: region.y})
    return topImage
  }

  const dstImage = fromSize({
    width: topImage.width + Math.max(srcImage.width - region.width, 0),
    height: topImage.height + Math.max(srcImage.height - region.height, 0),
  })

  if (region.width === srcImage.width) {
    const topExtImage = await extract(topImage, {
      x: 0,
      y: 0,
      width: topImage.width,
      height: region.y + region.height,
    })
    await copy(dstImage, topExtImage, {x: 0, y: 0})
  } else if (region.height === srcImage.height) {
    const leftExtImage = await extract(topImage, {
      x: 0,
      y: 0,
      width: region.x + region.width,
      height: topImage.height,
    })
    await copy(dstImage, leftExtImage, {x: 0, y: 0})
  } else {
    const topLeftExtImage = await extract(topImage, {
      x: 0,
      y: 0,
      width: region.x + region.width,
      height: region.y + region.height,
    })
    await copy(dstImage, topLeftExtImage, {x: 0, y: 0})

    const rightExtImage = await extract(topImage, {
      x: region.x + region.width,
      y: 0,
      width: topImage.width - (region.x + region.width),
      height: region.y,
    })
    await copy(dstImage, rightExtImage, {x: region.x + region.width, y: 0})

    const bottomExtImage = await extract(topImage, {
      x: 0,
      y: region.y + region.height,
      width: region.x,
      height: topImage.height - (region.y + region.height),
    })
    await copy(dstImage, bottomExtImage, {x: 0, y: region.y + region.height})
  }

  if (bottomImage.height > region.y + region.height || bottomImage.width > region.x + region.width) {
    // first image might be higher
    const yDiff = topImage.height - bottomImage.height
    if (region.width === srcImage.width) {
      const bottomExtImage = await extract(bottomImage, {
        x: 0,
        y: region.y - yDiff + region.height,
        width: bottomImage.width,
        height: bottomImage.height - (region.y - yDiff + region.height),
      })
      await copy(dstImage, bottomExtImage, {x: 0, y: region.y + Math.max(srcImage.height, region.height)})
    } else if (region.height === srcImage.height) {
      const rightExtImage = await extract(bottomImage, {
        x: region.x + region.width,
        y: 0,
        width: bottomImage.width - (region.x + region.width),
        height: bottomImage.height,
      })
      await copy(dstImage, rightExtImage, {x: region.x + Math.max(srcImage.width, region.width), y: 0})
    } else {
      const bottomRightExtImage = await extract(bottomImage, {
        x: region.x,
        y: region.y - yDiff,
        width: bottomImage.width - region.x,
        height: bottomImage.height - (region.y - yDiff),
      })

      await copy(dstImage, bottomRightExtImage, {
        x: region.x + Math.max(srcImage.width - region.width, 0),
        y: region.y + Math.max(srcImage.height - region.height, 0),
      })
    }
  }

  await copy(dstImage, srcImage, {x: region.x, y: region.y})

  return dstImage
}

function _interpolateCubic(x0: number, x1: number, x2: number, x3: number, t: number) {
  const a0 = x3 - x2 - x0 + x1
  const a1 = x0 - x1 - a0
  const a2 = x2 - x0

  return Math.ceil(Math.max(0, Math.min(255, a0 * (t * t * t) + a1 * (t * t) + (a2 * t + x1))))
}

function _interpolateRows(bufSrc: any, wSrc: any, hSrc: any, wDst: any) {
  const buf = new Uint8Array(wDst * hSrc * 4)
  for (let i = 0; i < hSrc; i += 1) {
    for (let j = 0; j < wDst; j += 1) {
      const x = (j * (wSrc - 1)) / wDst
      const xPos = Math.floor(x)
      const t = x - xPos
      const srcPos = (i * wSrc + xPos) * 4
      const buf1Pos = (i * wDst + j) * 4
      for (let k = 0; k < 4; k += 1) {
        const kPos = srcPos + k
        const x0 = xPos > 0 ? bufSrc[kPos - 4] : 2 * bufSrc[kPos] - bufSrc[kPos + 4]
        const x1 = bufSrc[kPos]
        const x2 = bufSrc[kPos + 4]
        const x3 = xPos < wSrc - 2 ? bufSrc[kPos + 8] : 2 * bufSrc[kPos + 4] - bufSrc[kPos]
        buf[buf1Pos + k] = _interpolateCubic(x0, x1, x2, x3, t)
      }
    }
  }

  return buf
}

function _interpolateColumns(bufSrc: any, hSrc: any, wDst: any, hDst: any) {
  const buf = new Uint8Array(wDst * hDst * 4)
  for (let i = 0; i < hDst; i += 1) {
    for (let j = 0; j < wDst; j += 1) {
      const y = (i * (hSrc - 1)) / hDst

      const yPos = Math.floor(y)
      const t = y - yPos
      const buf1Pos = (yPos * wDst + j) * 4
      const buf2Pos = (i * wDst + j) * 4
      for (let k = 0; k < 4; k += 1) {
        const kPos = buf1Pos + k
        const y0 = yPos > 0 ? bufSrc[kPos - wDst * 4] : 2 * bufSrc[kPos] - bufSrc[kPos + wDst * 4]
        const y1 = bufSrc[kPos]
        const y2 = bufSrc[kPos + wDst * 4]
        const y3 = yPos < hSrc - 2 ? bufSrc[kPos + wDst * 8] : 2 * bufSrc[kPos + wDst * 4] - bufSrc[kPos]

        buf[buf2Pos + k] = _interpolateCubic(y0, y1, y2, y3, t)
      }
    }
  }

  return buf
}

function _interpolateScale(bufColumns: any, wDst: any, hDst: any, wDst2: any, m: any, wM: any, hM: any) {
  const buf = new Uint8Array(wDst * hDst * 4)
  for (let i = 0; i < hDst; i += 1) {
    for (let j = 0; j < wDst; j += 1) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      let realColors = 0
      for (let y = 0; y < hM; y += 1) {
        const yPos = i * hM + y
        for (let x = 0; x < wM; x += 1) {
          const xPos = j * wM + x
          const xyPos = (yPos * wDst2 + xPos) * 4
          const pixelAlpha = bufColumns[xyPos + 3]
          if (pixelAlpha) {
            r += bufColumns[xyPos]
            g += bufColumns[xyPos + 1]
            b += bufColumns[xyPos + 2]
            realColors += 1
          }
          a += pixelAlpha
        }
      }

      const pos = (i * wDst + j) * 4
      buf[pos] = realColors ? Math.round(r / realColors) : 0
      buf[pos + 1] = realColors ? Math.round(g / realColors) : 0
      buf[pos + 2] = realColors ? Math.round(b / realColors) : 0
      buf[pos + 3] = Math.round(a / m)
    }
  }

  return buf
}

function _doBicubicInterpolation(src: any, dst: any) {
  // The implementation was taken from
  // https://github.com/oliver-moran/jimp/blob/master/resize2.js

  // when dst smaller than src/2, interpolate first to a multiple between 0.5 and 1.0 src, then sum squares
  const wM = Math.max(1, Math.floor(src.width / dst.width))
  const wDst2 = dst.width * wM
  const hM = Math.max(1, Math.floor(src.height / dst.height))
  const hDst2 = dst.height * hM

  // Pass 1 - interpolate rows
  // bufRows has width of dst2 and height of src
  const bufRows = _interpolateRows(src.data, src.width, src.height, wDst2)

  // Pass 2 - interpolate columns
  // bufColumns has width and height of dst2
  const bufColumns = _interpolateColumns(bufRows, src.height, wDst2, hDst2)

  // Pass 3 - scale to dst
  const m = wM * hM
  if (m > 1) {
    dst.data = _interpolateScale(bufColumns, dst.width, dst.height, wDst2, m, wM, hM)
  } else {
    dst.data = bufColumns
  }

  return dst
}

function _scaleImageIncrementally(src: any, dst: any) {
  let currentWidth = src.width
  let currentHeight = src.height
  const targetWidth = dst.width
  const targetHeight = dst.height

  dst.data = src.data
  dst.width = src.width
  dst.height = src.height

  // For ultra quality should use 7
  const fraction = 2

  do {
    const prevCurrentWidth = currentWidth
    const prevCurrentHeight = currentHeight

    // If the current width is bigger than our target, cut it in half and sample again.
    if (currentWidth > targetWidth) {
      currentWidth -= Math.floor(currentWidth / fraction)

      // If we cut the width too far it means we are on our last iteration. Just set it to the target width
      // and finish up.
      if (currentWidth < targetWidth) {
        currentWidth = targetWidth
      }
    }

    // If the current height is bigger than our target, cut it in half and sample again.
    if (currentHeight > targetHeight) {
      currentHeight -= Math.floor(currentHeight / fraction)

      // If we cut the height too far it means we are on our last iteration. Just set it to the target height
      // and finish up.
      if (currentHeight < targetHeight) {
        currentHeight = targetHeight
      }
    }

    // Stop when we cannot incrementally step down anymore.
    if (prevCurrentWidth === currentWidth && prevCurrentHeight === currentHeight) {
      return dst
    }

    // Render the incremental scaled image.
    const incrementalImage = fromSize({width: currentWidth, height: currentHeight})
    _doBicubicInterpolation(dst, incrementalImage)

    // Now treat our incremental partially scaled image as the src image
    // and cycle through our loop again to do another incremental scaling of it (if necessary).
    dst.data = incrementalImage.data
    dst.width = incrementalImage.width
    dst.height = incrementalImage.height
  } while (currentWidth !== targetWidth || currentHeight !== targetHeight)

  return dst
}
