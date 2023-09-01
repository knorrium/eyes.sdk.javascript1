import type {Renderer} from '../types'
import * as utils from '@applitools/utils'

export function extractRendererKey(renderer: Renderer) {
  const originalRenderer = utils.types.has(renderer, 'environment')
    ? (renderer.environment.renderer as Renderer) ?? renderer
    : renderer
  return JSON.stringify(originalRenderer)
}
