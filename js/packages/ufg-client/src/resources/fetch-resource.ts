import type {Cookie} from '../types'
import {type Logger} from '@applitools/logger'
import {makeReq, type Fetch, type Proxy} from '@applitools/req'
import {makeResource, type UrlResource, type ContentfulResource, FailedResource} from './resource'
import {createCookieHeader} from '../utils/create-cookie-header'
import {createUserAgentHeader} from '../utils/create-user-agent-header'
import throat from 'throat'
import * as utils from '@applitools/utils'
import {handleLogs, handleStreaming} from './fetch-utils'

type Options = {
  retryLimit?: number
  streamingTimeout?: number
  fetchConcurrency?: number
  fetchTimeout?: number
  cache?: Map<string, Promise<ContentfulResource | FailedResource>>
  fetch?: Fetch
  logger: Logger
}

export type FetchResourceSettings = {
  referer?: string
  proxy?: Proxy
  autProxy?: Proxy & {mode?: 'Allow' | 'Block'; domains?: string[]}
  cookies?: Cookie[]
  userAgent?: string
}

export type FetchResource = (options: {
  resource: UrlResource
  settings?: FetchResourceSettings
  logger?: Logger
}) => Promise<ContentfulResource | FailedResource>

export function makeFetchResource({
  retryLimit = 5,
  streamingTimeout = 30 * 1000,
  fetchTimeout = 30 * 1000,
  fetchConcurrency,
  cache = new Map(),
  fetch,
  logger: mainLogger,
}: Options): FetchResource {
  const req = makeReq({
    retry: {
      limit: retryLimit,
      validate: ({error}) => Boolean(error),
    },
    fetch,
  })
  return fetchConcurrency ? throat(fetchConcurrency, fetchResource) : fetchResource

  async function fetchResource({
    resource,
    settings = {},
    logger = mainLogger,
  }: {
    resource: UrlResource
    settings?: FetchResourceSettings
    logger?: Logger
  }): Promise<ContentfulResource | FailedResource> {
    logger = logger.extend(mainLogger, {tags: [`fetch-resource-${utils.general.shortid()}`]})
    let runningRequest = cache.get(resource.id)
    if (runningRequest) return runningRequest

    runningRequest = req(resource.url, {
      headers: {
        Referer: settings.referer,
        Cookie: settings.cookies && createCookieHeader({url: resource.url, cookies: settings.cookies}),
        'User-Agent': (resource.renderer && createUserAgentHeader({renderer: resource.renderer})) ?? settings.userAgent,
      },
      proxy: resourceUrl => {
        const {proxy, autProxy} = settings
        if (autProxy) {
          if (!autProxy.domains) return autProxy
          const domainMatch = autProxy.domains.includes(resourceUrl.hostname)
          if ((autProxy.mode === 'Allow' && domainMatch) || (autProxy.mode === 'Block' && !domainMatch)) return autProxy
        }
        return proxy
      },
      hooks: [handleLogs({logger}), handleStreaming({timeout: streamingTimeout, logger})],
      connectionTimeout: fetchTimeout,
    })
      .then(async response => {
        return response.ok
          ? makeResource({
              ...resource,
              value: Buffer.from(await response.arrayBuffer()),
              contentType: response.headers.get('Content-Type')!,
            })
          : makeResource({...resource, errorStatusCode: response.status})
      })
      .finally(() => cache.delete(resource.id))
    cache.set(resource.id, runningRequest)
    return runningRequest
  }
}
