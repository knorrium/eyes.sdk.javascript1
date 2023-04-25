import type {Awaitable} from '@applitools/utils'
import type {Options, Hooks, Retry} from './types.js'
import {AbortController} from 'abort-controller'
import {parse as urlToHttpOptions} from 'url' // should be replaced with `urlToHttpOptions` after supporting node >=16
import {Agent as HttpsAgent} from 'https'
import {stop, type Stop} from './stop.js'
import globalFetch, {Request, Headers, Response} from 'node-fetch'
import ProxyAgent from 'proxy-agent'
import * as utils from '@applitools/utils'

export type Req<TOptions extends Options = Options> = (
  input: string | URL | Request,
  ...options: TOptions[]
) => Promise<Response>

/**
 * Helper function that will create {@link req} function with predefined options
 * @example const req = makeReq({baseUrl: 'http://localhost:2107'})
 */
export function makeReq<TOptions extends Options = Options, TBaseOptions extends TOptions = TOptions>(
  baseOptions: Partial<TBaseOptions>,
): Req<TOptions> {
  return (location, options) => req(location, mergeOptions(baseOptions, options ?? {}))
}

export async function req(input: string | URL | Request, ...requestOptions: Options[]): Promise<Response> {
  const options = mergeOptions({}, ...requestOptions)
  const fetch = options?.fetch ?? globalFetch

  if (options?.hooks) options.hooks = utils.types.isArray(options.hooks) ? options.hooks : [options.hooks]
  if (options?.retry) options.retry = utils.types.isArray(options.retry) ? options.retry : [options.retry]
  if (options?.headers) {
    options.headers = Object.fromEntries(Object.entries(options.headers).filter(([_, value]) => value))
  }

  const controller = new AbortController()
  if (options?.signal) options.signal.onabort = () => controller.abort()

  const url = new URL(String((input as Request).url ?? input), options?.baseUrl)
  if (options?.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (!utils.types.isNull(value)) url.searchParams.set(key, String(value))
    })
  }
  let request = new Request(url, {
    method: options?.method ?? (input as Request).method,
    headers: {
      ...Object.fromEntries((input as Request).headers?.entries() ?? []),
      ...Object.fromEntries(new Headers(options?.headers as Record<string, string>).entries()),
    },
    body:
      utils.types.isPlainObject(options?.body) || utils.types.isArray(options?.body) || options?.body === null
        ? JSON.stringify(options?.body)
        : options?.body ?? (input as Request).body,
    highWaterMark: 1024 * 1024 * 100 + 1, // 100MB + 1b
    agent: url => {
      const proxy = utils.types.isFunction(options?.proxy) ? options?.proxy(url) : options?.proxy
      if (proxy) {
        const proxyUrl = new URL(proxy.url)
        proxyUrl.username = proxy.username ?? proxyUrl.username
        proxyUrl.password = proxy.password ?? proxyUrl.password
        const agent = new ProxyAgent({...urlToHttpOptions(proxyUrl.href), rejectUnauthorized: false} as any)
        agent.callback = utils.general.wrap(agent.callback.bind(agent), (fn, request, options, ...rest) => {
          return fn(request, {...options, rejectUnauthorized: false} as typeof options, ...rest)
        })
        return agent
      } else if (url.protocol === 'https:') {
        return new HttpsAgent({rejectUnauthorized: false})
      }
    },
    signal: controller.signal,
  })

  request = await beforeRequest({request, options})
  const timer = options?.timeout ? setTimeout(() => controller.abort(), options.timeout) : null
  try {
    let response = await fetch(request)

    // if the request has to be retried due to status code
    const retry = await (options?.retry as Retry[])?.reduce(async (prev, retry) => {
      const result = await prev
      return (
        result ??
        ((retry.statuses?.includes(response.status) || (await retry.validate?.({response}))) &&
        (!retry.limit || !retry.attempt || retry.attempt < retry.limit)
          ? retry
          : null)
      )
    }, Promise.resolve(null as Retry | null))
    if (retry) {
      retry.attempt ??= 0
      const delay = response.headers.has('Retry-After')
        ? Number(response.headers.get('Retry-After')) * 1000
        : utils.types.isArray(retry.timeout)
        ? retry.timeout[Math.min(retry.attempt, retry.timeout.length - 1)]
        : retry.timeout ?? 0
      await utils.general.sleep(delay)
      retry.attempt += 1

      const retryRequest = await beforeRetry({request, response, attempt: retry.attempt, stop, options})
      if (retryRequest !== stop) {
        return req(retryRequest, options)
      }
    }

    response = await afterResponse({request, response, options})
    return response
  } catch (error: any) {
    // if the request has to be retried due to network error
    const retry = await (options?.retry as Retry[])?.reduce((prev, retry) => {
      return prev.then(async result => {
        return result ??
          ((retry.codes?.includes(error.code) || (await retry.validate?.({error}))) &&
            (!retry.limit || !retry.attempt || retry.attempt < retry.limit))
          ? retry
          : null
      })
    }, Promise.resolve(null as Retry | null))
    if (retry) {
      retry.attempt ??= 0
      const delay = utils.types.isArray(retry.timeout)
        ? retry.timeout[Math.min(retry.attempt, retry.timeout.length)]
        : retry.timeout ?? 0
      await utils.general.sleep(delay)
      retry.attempt = retry.attempt + 1

      const retryRequest = await beforeRetry({request, error, attempt: retry.attempt, stop, options})
      if (retryRequest !== stop) {
        return req(retryRequest, options)
      }
    }

    error = await afterError({request, error, options})
    throw error
  } finally {
    if (timer) clearTimeout(timer)
    if (options?.signal) options.signal.onabort = null
  }
}

function mergeOptions<TOptions extends Options>(baseOptions: TOptions, ...options: TOptions[]): TOptions {
  const mergedOptions = options.reduce(
    (baseOptions, options) => ({
      ...baseOptions,
      ...options,
      query: {...baseOptions.query, ...options?.query},
      headers: {...baseOptions.headers, ...options?.headers},
      retry: [
        ...(baseOptions.retry ? ([] as Retry[]).concat(baseOptions.retry) : []),
        ...(options?.retry ? ([] as Retry[]).concat(options.retry) : []),
      ],
      hooks: [
        ...(baseOptions.hooks ? ([] as Hooks<TOptions>[]).concat(baseOptions.hooks) : []),
        ...(options?.hooks ? ([] as Hooks<TOptions>[]).concat(options.hooks) : []),
      ],
    }),
    baseOptions,
  )

  return ((mergedOptions.hooks ?? []) as Hooks<TOptions>[]).reduce(
    (options, hooks) => hooks.afterOptionsMerged?.({options}) ?? options,
    mergedOptions,
  )
}

function beforeRequest({request, options, ...rest}: Parameters<NonNullable<Hooks['beforeRequest']>>[0]) {
  return ((options?.hooks ?? []) as Hooks[]).reduce(async (request, hooks) => {
    request = await request
    const result = await hooks.beforeRequest?.({request, options, ...rest})
    if (!result) return request
    else if (utils.types.instanceOf(result, Request)) return result
    else if (utils.types.has(result, 'url')) return new Request(result.url, result.request ?? result)
    else return new Request(result.request, result)
  }, request as Awaitable<Request>)
}

function beforeRetry({request, options, ...rest}: Parameters<NonNullable<Hooks['beforeRetry']>>[0]) {
  return ((options?.hooks ?? []) as Hooks[]).reduce(async (request, hooks) => {
    request = await request
    if (request === stop) return request
    const result = await hooks.beforeRetry?.({request, options, ...rest})
    if (result === stop) return result
    else if (!result) return request
    else if (utils.types.instanceOf(result, Request)) return result
    else if (utils.types.has(result, 'url')) return new Request(result.url, result.request ?? result)
    else return new Request(result.request, result)
  }, request as Awaitable<Request | Stop>)
}

function afterResponse({response, options, ...rest}: Parameters<NonNullable<Hooks['afterResponse']>>[0]) {
  return ((options?.hooks ?? []) as Hooks[])?.reduce(async (response, hooks) => {
    response = await response
    const result = await hooks.afterResponse?.({response, options, ...rest})
    if (!result) return response
    else if (utils.types.instanceOf(result, Response)) return result
    else return new Response(result.body ?? result.response?.body, result.response ?? result)
  }, response as Awaitable<Response>)
}

function afterError({error, options, ...rest}: Parameters<NonNullable<Hooks['afterError']>>[0]) {
  return ((options?.hooks ?? []) as Hooks[])?.reduce(async (error, hooks) => {
    error = await error
    return (await hooks.afterError?.({error, ...rest})) || error
  }, error as Awaitable<Error>)
}
