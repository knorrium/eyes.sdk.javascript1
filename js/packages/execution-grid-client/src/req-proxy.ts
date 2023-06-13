import {type IncomingMessage, type ServerResponse} from 'http'
import {type Logger} from '@applitools/logger'
import {makeReq, type Req, type Proxy, type Retry, type Options} from '@applitools/req'
import * as utils from '@applitools/utils'

export type ReqProxyConfig = {
  targetUrl: string
  proxy?: Proxy
  retry?: Retry | Retry[]
  logger?: Logger
}

export type ReqProxyOptions = Options & {
  io: {request: IncomingMessage; response: ServerResponse; handle?: boolean}
  logger?: Logger
}

export type ReqProxy = Req<ReqProxyOptions>

export function makeReqProxy(config: ReqProxyConfig) {
  return makeReq<ReqProxyOptions>({
    baseUrl: config.targetUrl,
    proxy: config.proxy,
    retry: config.retry,
    hooks: {
      afterOptionsMerged({options}) {
        options.method ??= options.io.request.method
        options.headers = {
          ...options.io.request.headers,
          ...options.headers,
          host: options.baseUrl && new URL(options.baseUrl).host,
        }
        if (!['GET', 'HEAD'].includes(options.method?.toUpperCase() ?? 'GET')) {
          options.body ??= utils.streams.persist(options.io.request)
        }
        if (options.body && !utils.types.isFunction(options.body, 'pipe')) {
          options.headers['content-length'] = Buffer.byteLength(
            utils.types.isArray(options.body) || utils.types.isPlainObject(options.body) || options.body === null
              ? JSON.stringify(options.body)
              : options.body,
          ).toString()
        }
      },
      afterResponse({response, options}) {
        const io = options?.io
        if (io) {
          if (!response.headers.has('connection')) {
            if (io.request.httpVersion === '1.0') {
              response.headers.set('connection', 'close')
            } else if (io.request.httpVersion !== '2.0') {
              response.headers.set('connection', io.request.headers.connection || 'keep-alive')
            }
          }
          io.response.sendDate = false
          if (io.handle !== false) {
            io.response.writeHead(response.status, Object.fromEntries(response.headers.entries()))
            if (response.body) response.body.pipe(io.response)
            else io.response.end()
          }
        }
      },
    },
    logger: config.logger,
  })
}
