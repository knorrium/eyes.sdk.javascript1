import {makeResource, type ContentfulResource} from './resource'

export function makeResourceDom({cdt, resources}: Record<string, any>): ContentfulResource {
  const value = new TextEncoder().encode(
    JSON.stringify({
      resources: Object.fromEntries(Object.entries(resources).sort(([url1], [url2]) => (url1 > url2 ? 1 : -1))),
      domNodes: cdt,
    }),
  )
  const resource = makeResource({value, contentType: 'x-applitools-html/cdt'})
  resource.id = `dom/${resource.hash.hash}`
  return resource
}
