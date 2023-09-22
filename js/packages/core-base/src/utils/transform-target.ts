import type {ImageTarget, ImageSettings} from '../types'
import {promises as fs} from 'fs'
import {req} from '@applitools/req'
import {makeImage} from '@applitools/image'
import * as utils from '@applitools/utils'

export async function transformTarget({
  target,
  settings,
}: {
  target: ImageTarget
  settings?: ImageSettings
}): Promise<ImageTarget> {
  if (target.isTransformed) return target
  if (target.image instanceof URL) target.image = target.image.href
  if (utils.types.isString(target.image)) {
    const str = target.image // we need this var because ts-wise all our string formats checkers (isHttpUrl/isBase64) are string type guards
    if (utils.types.isHttpUrl(str)) {
      const response = await req(target.image, {proxy: settings?.autProxy})
      target.image = new Uint8Array(await response.arrayBuffer())
    } else if (!utils.types.isBase64(str) /* is file path/file protocol url */) {
      target.image = await fs.readFile(target.image.startsWith('file:') ? new URL(target.image) : target.image)
    }
  }
  const image = makeImage(target.image)

  if (settings?.normalization || settings?.region) {
    await image.debug({...settings.debugImages, suffix: 'original'})
    if (settings.normalization) {
      if (settings.normalization.scaleRatio) image.scale(settings.normalization.scaleRatio)
      if (settings.normalization.rotation) image.rotate(settings.normalization.rotation)
      if (settings.normalization.cut) image.crop(settings.normalization.cut)
      await image.debug({...settings.debugImages, suffix: 'normalized'})
    }
    if (settings.region) {
      image.crop(settings.region)
      await image.debug({...settings.debugImages, suffix: 'region'})
    }
    if (settings.normalization?.limit) {
      const maxHeight = Math.min(
        image.height,
        settings.normalization.limit.maxImageArea / image.width,
        settings.normalization.limit.maxImageHeight,
      )
      image.crop({left: 0, right: 0, top: 0, bottom: image.height - maxHeight})
      await image.debug({...settings.debugImages, suffix: 'limited'})
    }
  }

  target.image = await image.toPng()

  if (!target.size || settings?.normalization || settings?.region) {
    target.size = image.size
  }

  return target
}
