import type {Cookie} from '../types'
import {type Logger} from '@applitools/logger'
import {makeReq, type Fetch, type Proxy, type Hooks} from '@applitools/req'
import {makeResource, type UrlResource, type ContentfulResource, FailedResource} from './resource'
import {createCookieHeader} from '../utils/create-cookie-header'
import {createUserAgentHeader} from '../utils/create-user-agent-header'
import {AbortController} from 'abort-controller'
import throat from 'throat'
import * as utils from '@applitools/utils'

type Options = {
  concurrency?: number
  accessToken?: string
  eyesServerUrl?: string
  apiKey?: string
  tunnelIds?: string
  timeout?: number
  streamingTimeout?: number
  retryLimit?: number
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
  concurrency,
  accessToken,
  eyesServerUrl,
  apiKey,
  tunnelIds,
  retryLimit = 5,
  timeout = 30 * 1000,
  streamingTimeout = 30 * 1000,
  cache = new Map(),
  fetch,
  logger: mainLogger,
}: Options): FetchResource {
  const req = makeReq({
    retry: {
      limit: retryLimit,
      validate: ({error}) => !!error,
    },
    fetch,
  })
  return concurrency ? throat(concurrency, fetchResource) : fetchResource

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
      hooks: [
        handleTunneledResource({accessToken, eyesServerUrl, apiKey, tunnelIds}),
        handleLogs({logger}),
        handleStreaming({timeout: streamingTimeout, logger}),
      ],
      connectionTimeout: timeout,
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

function handleTunneledResource({
  eyesServerUrl,
  apiKey,
  accessToken,
  tunnelIds,
}: {
  accessToken?: string
  eyesServerUrl?: string
  apiKey?: string
  tunnelIds?: string
}): Hooks {
  if (!tunnelIds) return {}
  return {
    beforeRequest({request}) {
      if (request.url !== 'https://exec-wus.applitools.com/handle-resource') {
        return {
          url: 'https://exec-wus.applitools.com/handle-resource',
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-tunnel-ids': tunnelIds,
            'x-eyes-server-url': eyesServerUrl!,
            'x-eyes-api-key': apiKey!,
            'x-ufg-jwt-token': accessToken!,
          },
          body: JSON.stringify({
            resourceUrl: request.url,
            requestHeaders: Object.fromEntries(request.headers.entries()),
            requestTotalTimeout: 30_000,
          }),
        }
      }
    },
    afterResponse({response}) {
      if (response.headers.has('x-fetch-status-code')) {
        const headers: Record<string, string> = {}
        for (const [name, value] of response.headers) {
          if (name.startsWith('x-fetch-response-header')) {
            headers[name.replace('x-fetch-response-header-', '')] = value
          }
        }
        return {
          body: response.body,
          status: Number(response.headers.get('x-fetch-status-code')),
          statusText: response.headers.get('x-fetch-status-text')!,
          headers,
        }
      }
    },
  }
}

function handleLogs({logger}: {logger?: Logger}): Hooks {
  return {
    async beforeRequest({request}) {
      logger?.log(
        `Resource with url ${request.url} will be fetched using headers`,
        Object.fromEntries(request.headers.entries()),
        `and body ${JSON.stringify(await request.clone().text())}`,
      )
    },
    beforeRetry({request, attempt}) {
      logger?.log(`Resource with url ${request.url} will be re-fetched (attempt ${attempt})`)
    },
    afterResponse({request, response}) {
      logger?.log(`Resource with url ${request.url} respond with ${response.statusText}(${response.statusText})`)
    },
    afterError({request, error}) {
      logger?.error(`Resource with url ${request.url} failed with error`, error)
    },
  }
}

function handleStreaming({timeout, logger}: {timeout: number; logger?: Logger}): Hooks {
  const controller = new AbortController()
  return {
    async beforeRequest({request}) {
      if (request.signal?.aborted) return
      request.signal?.addEventListener('abort', () => controller.abort())
      return {request, signal: controller.signal}
    },
    async afterResponse({response}) {
      const contentLength = response.headers.get('Content-Length')
      const contentType = response.headers.get('Content-Type')
      const isProbablyStreaming = response.ok && !contentLength && contentType && /^(audio|video)\//.test(contentType)
      if (!isProbablyStreaming) return
      return new Promise(resolve => {
        const timer = setTimeout(() => {
          controller.abort()
          resolve({status: 599})
          logger?.log(`Resource with url ${response.url} was interrupted, due to it takes too long to download`)
        }, timeout)
        response
          .arrayBuffer()
          .then(body => resolve({response, body: Buffer.from(body)}))
          .catch(() => resolve({status: 599}))
          .finally(() => clearTimeout(timer))
      })
    },
  }
}
