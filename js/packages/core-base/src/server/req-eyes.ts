import type {EyesServerSettings} from '../types'
import {type Logger} from '@applitools/logger'
import globalReq, {makeReq, type Req, type Options, type Hooks, type Fetch} from '@applitools/req'
import * as utils from '@applitools/utils'

export type ReqEyesSettings = EyesServerSettings & {
  connectionTimeout?: number
  removeSession?: boolean
}

export type ReqEyesOptions = Options & {
  name?: string
  expected?: number | number[]
  logger?: Logger
}

export type ReqEyes = Req<ReqEyesOptions>

export function makeReqEyes({settings, fetch, logger}: {settings: ReqEyesSettings; fetch?: Fetch; logger?: Logger}) {
  return makeReq<ReqEyesOptions>({
    baseUrl: settings.eyesServerUrl,
    query: {apiKey: settings.apiKey, removeSession: settings.removeSession},
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-applitools-eyes-client': settings.agentId,
      'User-Agent': settings.agentId,
    },
    proxy: settings.proxy,
    useDnsCache: settings.useDnsCache,
    connectionTimeout: settings.connectionTimeout ?? 300000 /* 5min */,
    retry: [
      // retry on network issues
      {
        limit: 5,
        timeout: 200,
        statuses: [404, 500, 502, 504],
        codes: ['ECONNRESET', 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'],
      },
      // retry on requests that were blocked by concurrency
      {
        timeout: [...Array(5).fill(2000) /* 5x2s */, ...Array(4).fill(5000) /* 4x5s */, 10000 /* 10s */],
        statuses: [503],
      },
    ],
    hooks: [handleLongRequests({req: globalReq}), handleLogs({logger}), handleUnexpectedResponse()],
    fetch,
  })
}

function handleLogs({logger: defaultLogger}: {logger?: Logger} = {}): Hooks<ReqEyesOptions> {
  const guid = utils.general.guid()
  let counter = 0

  return {
    beforeRequest({request, options}) {
      const logger = options?.logger ?? defaultLogger
      let requestId = request.headers.get('x-applitools-eyes-client-request-id')
      if (!requestId) {
        requestId = `${counter++}--${guid}`
        request.headers.set('x-applitools-eyes-client-request-id', requestId)
      }

      logger?.log(
        `Request "${options?.name}" [${requestId}] will be sent to the address "[${request.method}]${request.url}" with body`,
        options?.body,
      )
    },
    beforeRetry({request, attempt, error, response, options}) {
      const logger = options?.logger ?? defaultLogger
      const requestId = request.headers.get('x-applitools-eyes-client-request-id')!
      logger?.log(
        `Request "${options?.name}" [${requestId}] that was sent to the address "[${request.method}]${request.url}" with body`,
        options?.body,
        `is going to retried due to ${error ? 'an error' : 'a response with status'}`,
        error ?? `${response!.statusText}(${response!.status})`,
      )
      request.headers.set('x-applitools-eyes-client-request-id', `${requestId.split('#', 1)[0]}#${attempt + 1}`)
    },
    async afterResponse({request, response, options}) {
      const logger = options?.logger ?? defaultLogger
      const requestId = request.headers.get('x-applitools-eyes-client-request-id')
      logger?.log(
        `Request "${options?.name}" [${requestId}] that was sent to the address "[${request.method}]${request.url}" respond with ${response.statusText}(${response.status})`,
        !response.ok ? `and body ${JSON.stringify(await response.clone().text())}` : '',
      )
    },
    afterError({request, error, options}) {
      const logger = options?.logger ?? defaultLogger
      const requestId = request.headers.get('x-applitools-eyes-client-request-id')
      logger?.error(
        `Request "${options?.name}" [${requestId}] that was sent to the address "[${request.method}]${request.url}" failed with error`,
        error,
      )
    },
  }
}

function handleUnexpectedResponse(): Hooks<ReqEyesOptions> {
  return {
    async afterResponse({request, response, options}) {
      if (
        options?.expected &&
        (utils.types.isArray(options?.expected)
          ? !options.expected.includes(response.status)
          : options.expected !== response.status)
      ) {
        throw new Error(
          `Request "${options?.name}" that was sent to the address "[${request.method}]${request.url}" failed due to unexpected status ${response.statusText}(${response.status})`,
        )
      }
    },
  }
}

function handleLongRequests({req}: {req: Req<ReqEyesOptions>}): Hooks {
  return {
    beforeRequest({request}) {
      request.headers.set('Eyes-Expect-Version', '2')
      request.headers.set('Eyes-Expect', '202+location')
      request.headers.set('Eyes-Date', new Date().toUTCString())
    },
    async afterResponse({request, response, options}) {
      if (response.status === 202 && response.headers.has('Location')) {
        if (response.headers.has('Retry-After')) {
          await utils.general.sleep(Number(response.headers.get('Retry-After')) * 1000)
        }

        // polling for result
        const pollResponse = await req(response.headers.get('Location')!, options ?? {}, {
          method: 'GET',
          body: undefined,
          expected: undefined,
          retry: {
            statuses: [200],
            timeout: [...Array(5).fill(1000) /* 5x1s */, ...Array(5).fill(2000) /* 5x2s */, 5000 /* 5s */],
          },
          hooks: {
            beforeRetry({request, response}) {
              if (response && response.status === 200 && response.headers.has('Location')) {
                return {request, url: response.headers.get('Location')!}
              }
            },
          },
        })

        // getting result of the initial request
        const resultResponse = await req(pollResponse.headers.get('Location')!, options ?? {}, {
          method: 'DELETE',
          expected: undefined,
          hooks: {
            beforeRetry({response, stop}) {
              // if the long request is blocked due to concurrency the whole long request should start over
              if (response?.status === 503) return stop
            },
          },
        })

        return resultResponse.status === 503 ? req(request, options ?? {}) : resultResponse
      }
    },
  }
}
