import {type Renderer} from '@applitools/ufg-client'

export function uniquifyRenderers(renderers: Renderer[]): Renderer[] {
  const duplications = new Map(renderers.map(renderer => [JSON.stringify(renderer), 0]))
  return renderers.reduce((uniqueRenderers, renderer) => {
    const key = JSON.stringify(renderer)
    let index = duplications.get(key)
    if (index > 0) {
      if (!renderer.id) {
        let uniqueRenderer: Renderer
        do {
          uniqueRenderer = {...renderer, id: `${index}`}
          index += 1
        } while (duplications.has(JSON.stringify(uniqueRenderer)))
        uniqueRenderers.push(uniqueRenderer)
      }
    } else {
      index += 1
      uniqueRenderers.push(renderer)
    }
    duplications.set(key, index)
    return uniqueRenderers
  }, [] as Renderer[])
}
