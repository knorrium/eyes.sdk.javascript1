import type {UFGClient, UFGClientSettings} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeUFGRequests} from './server/requests'
import {makeCreateRenderTarget} from './create-render-target'
import {makeGetRenderEnvironment} from './get-render-environment'
import {makeRender} from './render'
import {makeProcessResources} from './resources/process-resources'
import {makeFetchResource} from './resources/fetch-resource'
import {makeUploadResource} from './resources/upload-resource'

export const defaultResourceCache = new Map<string, any>()

export function makeUFGClient({
  settings,
  cache = defaultResourceCache,
  logger,
}: {
  settings: UFGClientSettings
  cache?: Map<string, any>
  logger?: Logger
}): UFGClient {
  logger = makeLogger({logger, format: {label: 'ufg-client'}})

  const requests = makeUFGRequests({settings, logger})
  const fetchResource = makeFetchResource({
    concurrency: settings.fetchConcurrency,
    tunnelIds: settings.tunnelIds,
    accessToken: settings.accessToken,
    eyesServerUrl: settings.eyesServerUrl,
    apiKey: settings.apiKey,
    logger,
  })
  const uploadResource = makeUploadResource({requests, logger})
  const processResources = makeProcessResources({fetchResource, uploadResource, cache, logger})

  return {
    createRenderTarget: makeCreateRenderTarget({processResources, logger}),
    getRenderEnvironment: makeGetRenderEnvironment({requests, logger}),
    render: makeRender({requests, logger}),
    getChromeEmulationDevices: requests.getChromeEmulationDevices,
    getAndroidDevices: requests.getAndroidDevices,
    getIOSDevices: requests.getIOSDevices,
    getCachedResourceUrls: () => Array.from(cache.keys()),
  }
}
