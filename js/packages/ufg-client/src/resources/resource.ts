import type {Optional} from '@applitools/utils'
import type {Renderer} from '../types'
import {createHash} from 'crypto'
import * as utils from '@applitools/utils'

const UFG_MAX_RESOURCE_SIZE = 34.5 * 1024 * 1024

// Note: when using async cache, we whitelist the properties of KnownResource in order to not save anything that we don't want in the cache.
// It's not possible to reference the type in runtime, so please make sure that if properties are added here, they need to be added to the callback
// of asyncCache.getCachedResource
export type KnownResource = {
  hash: HashedResource | {errorStatusCode: number}
  dependencies?: string[]
}

export type FailedResource = {
  id: string
  errorStatusCode: number
  hash: {errorStatusCode: number}
}

export type RawContenfulResource = {
  id: string
  url: string
  value: string
  contentType: string
  dependencies?: string[]
}

export type ContentfulResource = {
  id: string
  url: string
  value: Uint8Array
  contentType: string
  hash: HashedResource
  dependencies?: string[]
}

export type UrlResource = {
  id: string
  url: string
  renderer?: Renderer
}

export type HashedResource = {
  hash: string
  hashFormat: 'sha256'
  contentType: string
}

export function makeResource(resource: Omit<FailedResource, 'hash'>): FailedResource
export function makeResource(resource: Optional<RawContenfulResource, 'id' | 'url' | 'contentType'>): ContentfulResource
export function makeResource(
  resource: Omit<Optional<ContentfulResource, 'id' | 'url' | 'contentType'>, 'hash'>,
): ContentfulResource
export function makeResource(resource: Omit<UrlResource, 'id'>): UrlResource
export function makeResource(
  resource:
    | Omit<FailedResource, 'hash'>
    | Optional<RawContenfulResource, 'id' | 'url' | 'contentType'>
    | Omit<Optional<ContentfulResource, 'id' | 'url' | 'contentType'>, 'hash'>
    | Omit<UrlResource, 'id'>,
): FailedResource | ContentfulResource | UrlResource {
  if (utils.types.has(resource, 'errorStatusCode')) {
    const failedResource = {
      id: resource.id,
      errorStatusCode: resource.errorStatusCode,
      hash: {errorStatusCode: resource.errorStatusCode},
    } as FailedResource
    return failedResource
  } else if (utils.types.has(resource, 'value')) {
    const contentfulResource = {
      id: resource.id ?? resource.url,
      url: resource.url,
      value: getResourceValue(resource.value),
      contentType: resource.contentType || 'application/x-applitools-unknown',
      dependencies: resource.dependencies,
    } as ContentfulResource
    if (!isDomOrVHS(resource as ContentfulResource) && resource.value?.length > UFG_MAX_RESOURCE_SIZE) {
      contentfulResource.value = contentfulResource.value.subarray(0, UFG_MAX_RESOURCE_SIZE - 100000)
    }
    contentfulResource.hash = makeHashedResource(contentfulResource)
    return contentfulResource
  } else {
    const urlResource = {
      id: (resource as UrlResource).id ?? resource.url,
      url: resource.url,
    } as UrlResource
    if (resource.renderer && isRendererDependantResource(resource as UrlResource)) {
      urlResource.renderer = resource.renderer
      urlResource.id += `~${extractRendererName(resource as UrlResource)}`
    }
    return urlResource
  }
}

export function makeHashedResource(resource: ContentfulResource): HashedResource {
  return {
    hashFormat: 'sha256',
    hash: createHash('sha256').update(resource.value).digest('hex'),
    contentType: resource.contentType,
  }
}

function isDomOrVHS(resource: ContentfulResource) {
  return [
    'x-applitools-html/cdt',
    'x-applitools-vhs/ios',
    'x-applitools-vhs/android-x',
    'x-applitools-vhs/android-support',
  ].includes(resource.contentType)
}

function isRendererDependantResource({url}: UrlResource) {
  return /https:\/\/fonts.googleapis.com/.test(url)
}

function extractRendererName({renderer}: UrlResource) {
  if (!utils.types.has(renderer, 'name')) return
  const [browserName] = (renderer.name as string).split(/[-\d]/, 1)
  return browserName
}

function getResourceValue(value: Uint8Array | string | undefined): Uint8Array {
  return value ? (utils.types.isString(value) ? Buffer.from(value, 'base64') : value) : new Uint8Array(0)
}
