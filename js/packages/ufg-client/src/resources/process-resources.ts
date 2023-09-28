import type {Renderer, AsyncCache} from '../types'
import {
  makeResource,
  type UrlResource,
  type ContentfulResource,
  type HashedResource,
  type KnownResource,
  type FailedResource,
} from './resource'
import {type Logger} from '@applitools/logger'
import {type FetchResource, type FetchResourceSettings} from './fetch-resource'
import {type UploadResource} from './upload-resource'
import {extractCssDependencyUrls} from '../utils/extract-css-dependency-urls'
import {extractSvgDependencyUrls} from '../utils/extract-svg-dependency-urls'
import {freezeGif} from '@applitools/image'
import * as utils from '@applitools/utils'

type AwaitableKnownResource = KnownResource & {ready: boolean | Promise<boolean>}

export type Options = {
  fetchResource: FetchResource
  uploadResource: UploadResource
  cache?: Map<string, AwaitableKnownResource>
  asyncCache?: AsyncCache
  logger: Logger
}

export type ProcessResources = (options: {
  resources: Record<string, FailedResource | ContentfulResource | UrlResource>
  settings?: ProcessResourcesSettings
  logger?: Logger
}) => Promise<{mapping: ResourceMapping; promise: Promise<ResourceMapping>}>

export type ProcessResourcesSettings = FetchResourceSettings & {renderer?: Renderer}

export type ResourceMapping = Record<string, HashedResource | {errorStatusCode: number}>

export function makeProcessResources({
  fetchResource,
  uploadResource,
  cache = new Map(),
  asyncCache,
  logger: mainLogger,
}: Options): ProcessResources {
  return async function processResources({
    resources,
    settings,
    logger = mainLogger,
  }: {
    resources: Record<string, ContentfulResource | UrlResource | FailedResource>
    settings?: ProcessResourcesSettings
    logger?: Logger
  }): Promise<{mapping: ResourceMapping; promise: Promise<ResourceMapping>}> {
    logger = logger.extend(mainLogger, {tags: [`process-resources-${utils.general.shortid()}`]})

    const processedResources = await Object.entries(resources).reduce(
      async (processedResourcesPromise, [url, resource]) => {
        if (utils.types.has(resource, 'value') || utils.types.has(resource, 'errorStatusCode')) {
          // process contentful resource or failed resource

          // In case of async cache, we don't want another process to fetch the resource. So we take ownership of handing it.
          // If the resource is already in the cache, then we would use the value from the cache rather than the value we have in this memory.
          // The assumption is that the cache can't hold a different value than what we have now.
          const processedResource = asyncCache
            ? await getCachedResource(resource.id, () => processContentfulResource({resource, logger}), logger)
            : await processContentfulResource({resource, logger})

          return Object.assign(await processedResourcesPromise, {[url]: processedResource})
        } else {
          // process url resource with dependencies
          const processedResourceWithDependencies = await processUrlResourceWithDependencies({
            resource,
            settings,
            logger,
          })
          return Object.assign(await processedResourcesPromise, processedResourceWithDependencies)
        }
      },
      Promise.resolve({} as Record<string, KnownResource & {ready: boolean | Promise<boolean>}>),
    )

    const mapping = {} as ResourceMapping
    const ready = [] as (boolean | Promise<boolean>)[]
    for (const [url, processedResource] of Object.entries(processedResources)) {
      mapping[url] = processedResource.hash
      ready.push(processedResource.ready)
    }

    return {mapping, promise: Promise.all(ready).then(() => mapping)}
  }

  async function processContentfulResource({
    resource,
    logger = mainLogger,
  }: {
    resource: ContentfulResource | FailedResource
    logger?: Logger
  }) {
    if (utils.types.has(resource, 'value')) {
      if (/image\/gif/.test(resource.contentType)) {
        try {
          logger.log(`Freezing gif image resource with id ${resource.id}`)
          resource = makeResource({...resource, value: await freezeGif(resource.value)})
        } catch (error) {
          logger.warn(`Failed to freeze gif image resource with id ${resource.id} due to an error`, error)
        }
      }

      resource.dependencies = resource.dependencies?.filter(url => /^https?:/.test(url))
    }
    return persistResource({resource, logger})
  }

  async function processUrlResource({
    resource,
    settings,
    logger = mainLogger,
  }: {
    resource: UrlResource
    settings?: ProcessResourcesSettings
    logger?: Logger
  }): Promise<KnownResource | null> {
    if (!/^https?:/i.test(resource.url)) {
      return null
    }
    if (asyncCache) {
      return await getCachedResource(resource.id, fetchAndUpload, logger)
    } else {
      const cachedResource = cache.get(resource.id)
      if (cachedResource) {
        const dependencies = cachedResource.dependencies || []
        logger.log(
          `resource retrieved from cache, with dependencies (${dependencies.length}): ${resource.url} with dependencies --> ${dependencies}`,
        )
        return cachedResource
      }

      return await fetchAndUpload()
    }

    async function fetchAndUpload(): Promise<KnownResource & {ready?: boolean | Promise<boolean>}> {
      try {
        const fetchedResource = await fetchResource({resource, settings, logger})
        if (utils.types.has(fetchedResource, 'value')) {
          const dependencies = await extractDependencyUrls({
            resource: fetchedResource,
            settings: {sourceUrl: settings?.headers?.Referer},
            logger,
          })
          logger.log(`dependencyUrls for ${resource.url} --> ${dependencies}`)
          fetchedResource.dependencies = dependencies
        }
        return processContentfulResource({resource: fetchedResource, logger})
      } catch (err) {
        logger.log(`error fetching resource at ${resource.url}, setting errorStatusCode to 504. err=${err}`)
        return makeResource({...resource, errorStatusCode: 504})
      }
    }
  }

  async function processUrlResourceWithDependencies({
    resource,
    settings,
    logger = mainLogger,
  }: {
    resource: UrlResource
    settings?: ProcessResourcesSettings
    logger?: Logger
  }): Promise<Record<string, KnownResource>> {
    const processedResourcesWithDependencies = {} as Record<string, KnownResource>

    await doProcessUrlResourceWithDependencies(resource)

    return processedResourcesWithDependencies

    async function doProcessUrlResourceWithDependencies(resource: UrlResource) {
      const processedResource = await processUrlResource({resource, settings, logger})

      if (processedResource) {
        processedResourcesWithDependencies[resource.url] = processedResource
        if (processedResource.dependencies) {
          const dependencyResources = processedResource.dependencies.flatMap(dependencyUrl => {
            if (processedResourcesWithDependencies[dependencyUrl]) return []
            return makeResource({url: dependencyUrl, renderer: settings?.renderer})
          })
          await Promise.all(dependencyResources.map(doProcessUrlResourceWithDependencies))
        }
      }
    }
  }

  function persistResource({
    resource,
    logger = mainLogger,
  }: {
    resource: ContentfulResource | FailedResource
    logger?: Logger
  }): AwaitableKnownResource {
    const entry = {
      hash: resource.hash,
      dependencies: (resource as ContentfulResource).dependencies,
    } as AwaitableKnownResource
    if (utils.types.has(resource, 'value')) {
      if (asyncCache) {
        entry.ready = asyncCache.isUploadedToUFG(JSON.stringify(resource.hash), () =>
          uploadResource({resource, logger})
            .then(() => true)
            .catch(() => false),
        )
      } else {
        entry.ready = uploadResource({resource, logger})
          .then(() => {
            const entry = cache.get(resource.id)!
            cache.set(resource.id, {...entry, ready: true})
            return true
          })
          .catch(err => {
            cache.delete(resource.id)
            throw err
          })
      }
    } else {
      entry.ready = true
    }
    cache.set(resource.id, entry)
    return entry
  }

  async function extractDependencyUrls({
    resource,
    settings,
    logger = mainLogger,
  }: {
    resource: ContentfulResource
    settings?: {sourceUrl?: string}
    logger?: Logger
  }): Promise<string[]> {
    try {
      let dependencyUrls = [] as string[]
      if (/text\/css/.test(resource.contentType)) {
        dependencyUrls = extractCssDependencyUrls(new TextDecoder().decode(resource.value), {
          resourceUrl: resource.url,
          sourceUrl: settings?.sourceUrl,
        })
      } else if (/image\/svg/.test(resource.contentType)) {
        dependencyUrls = extractSvgDependencyUrls(new TextDecoder().decode(resource.value), {
          resourceUrl: resource.url,
          sourceUrl: settings?.sourceUrl,
        })
      }
      // avoid recursive dependencies
      return dependencyUrls.filter(dependencyUrl => dependencyUrl !== resource.url)
    } catch (e) {
      logger.log(`could not parse ${resource.contentType} ${resource.url}`, e)
      return []
    }
  }

  // Note: this function is needed since the contract with async cache is to return a serializeable object.
  // So we need to peel off `ready` which is a promise, but still use it as the return value from the callback.
  function getCachedResource(
    key: string,
    callback: () => Promise<KnownResource & {ready?: boolean | Promise<boolean>}>,
    logger: Logger,
  ): Promise<KnownResource> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!key) {
          logger.log('key for async cache is falsy, not accessing async cache (this is an error that!)', key)
          resolve(await callback())
          return
        }
        const resourceFromCache = await asyncCache!.getCachedResource(key, async () => {
          logger.log(`async cache callback called for ${key}`)
          const ret = await callback()
          resolve(ret)

          // We also want to make sure the value of the resource is not included in the cache. So better yet, just whitelist the properties of KnownResource
          // See note in KnownResource type
          return {
            hash: ret.hash,
            dependencies: ret.dependencies,
          }
        })
        logger.log(`return value from async cache for ${key}:`, resourceFromCache)
        resolve(resourceFromCache)
      } catch (err) {
        logger.log(`error from async cache for ${key}:`, err)
        reject(err)
      }
    })
  }
}
