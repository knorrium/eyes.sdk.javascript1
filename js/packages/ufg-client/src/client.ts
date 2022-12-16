import type {UFGClient} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeUFGRequests, type UFGRequestsConfig} from './server/requests'
import {makeCreateRenderTarget} from './create-render-target'
import {makeBookRenderer} from './book-renderer'
import {makeRender} from './render'
import {makeProcessResources} from './resources/process-resources'
import {makeFetchResource} from './resources/fetch-resource'
import {makeUploadResource} from './resources/upload-resource'

export const defaultResourceCache = new Map<string, any>()

export function makeUFGClient({
  config,
  concurrency,
  cache = defaultResourceCache,
  logger,
}: {
  config: UFGRequestsConfig
  concurrency?: number
  cache?: Map<string, any>
  logger?: Logger
}): UFGClient {
  logger = logger?.extend({label: 'ufg client'}) ?? makeLogger({label: 'ufg client'})

  const requests = makeUFGRequests({config, logger})
  const fetchResource = makeFetchResource({logger})
  const uploadResource = makeUploadResource({requests, logger})
  const processResources = makeProcessResources({fetchResource, uploadResource, cache, logger})

  return {
    createRenderTarget: makeCreateRenderTarget({processResources}),
    bookRenderer: makeBookRenderer({requests, logger}),
    render: makeRender({requests, concurrency, logger}),
    getChromeEmulationDevices: requests.getChromeEmulationDevices,
    getAndroidDevices: requests.getAndroidDevices,
    getIOSDevices: requests.getIOSDevices,
    getCachedResourceUrls: () => Array.from(cache.keys()),
  }
}
