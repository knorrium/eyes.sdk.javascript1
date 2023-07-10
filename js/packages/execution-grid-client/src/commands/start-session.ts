import type {ECSession, ECCapabilitiesOptions, ECClientSettings} from '../types'
import {type IncomingMessage, type ServerResponse} from 'http'
import {type Logger} from '@applitools/logger'
import {type ReqProxy} from '../req-proxy'
import {type TunnelManager} from '../tunnels/manager'
//@ts-ignore
import {prepareEnvironment} from '@applitools/execution-grid-tunnel'
import {AbortController, type AbortSignal} from 'abort-controller'
import * as utils from '@applitools/utils'

type Options = {
  settings: ECClientSettings
  req: ReqProxy
  tunnels?: TunnelManager
}

const SERVER_URLS = {
  'us-west': 'https://exec-wus.applitools.com',
  australia: 'https://exec-au.applitools.com',
}

const RETRY_BACKOFF = [
  ...Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
  ...Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
  10000, // all next tries with delay 10s
]

export function makeStartSession({settings, req, tunnels}: Options) {
  const queues = new Map<string, utils.queues.CorkableQueue<ECSession, AbortController>>()

  return async function createSession({
    request,
    response,
    logger,
  }: {
    request: IncomingMessage
    response: ServerResponse
    logger: Logger
  }): Promise<ECSession> {
    const requestBody = await utils.streams.toJSON(request)

    logger.log(`Request was intercepted with body:`, requestBody)

    let capabilities: Record<string, any> = {}

    if (!utils.types.isEmpty(requestBody.desiredCapabilities)) {
      capabilities = requestBody.desiredCapabilities
    } else if (!utils.types.isEmpty(requestBody.capabilities?.alwaysMatch)) {
      capabilities = requestBody.capabilities.alwaysMatch
    } else if (!utils.types.isEmpty(requestBody.capabilities?.firstMatch?.[0])) {
      capabilities = requestBody.capabilities?.firstMatch?.[0]
    }

    const options = {
      ...settings.options,
      ...capabilities?.['applitools:options'],
      ...(capabilities &&
        Object.fromEntries(
          Object.entries(capabilities).map(([key, value]) => [key.replace(/^applitools:/, ''), value]),
        )),
    } as ECCapabilitiesOptions

    const session = {
      serverUrl: settings.serverUrl,
      proxy: settings.proxy,
      credentials: {eyesServerUrl: options.eyesServerUrl, apiKey: options.apiKey},
      options,
    } as ECSession

    if (options.region) {
      if (SERVER_URLS[options.region]) session.serverUrl = SERVER_URLS[options.region]
      else throw new Error(`Failed to create session in unknown region ${options.region}`)
    }

    if (options.tunnel && tunnels) {
      // TODO should be removed once tunnel spawning issue is solved
      await prepareEnvironment({egTunnelManagerUrl: session.serverUrl})
      session.tunnels = await tunnels.acquire({...session.credentials, tunnelServerUrl: session.serverUrl})
    }

    const applitoolsCapabilities = Object.fromEntries([
      ...Object.entries(options).map(([key, value]) => [`applitools:${key}`, value]),
      ...(session.tunnels?.map((tunnel, index) => [`applitools:x-tunnel-id-${index}`, tunnel.tunnelId]) ?? []),
    ])

    if (!utils.types.isEmpty(requestBody.desiredCapabilities)) {
      requestBody.desiredCapabilities = {...requestBody.desiredCapabilities, ...applitoolsCapabilities}
    } else if (!utils.types.isEmpty(requestBody.capabilities?.alwaysMatch)) {
      requestBody.capabilities.alwaysMatch = {...requestBody.capabilities?.alwaysMatch, ...applitoolsCapabilities}
    } else if (!utils.types.isEmpty(requestBody.capabilities?.firstMatch?.[0])) {
      requestBody.capabilities.firstMatch = [{...requestBody.capabilities.firstMatch[0], ...applitoolsCapabilities}]
    } else {
      requestBody.desiredCapabilities = {...applitoolsCapabilities}
    }

    logger.log('Request body has modified:', requestBody)

    const queueKey = JSON.stringify(session.credentials)
    let queue = queues.get(queueKey)!
    if (!queue) {
      queue = utils.queues.makeCorkableQueue<ECSession, AbortController>({
        makeAbortController: () => new AbortController(),
      })
      queues.set(queueKey, queue)
    }

    request.socket.on('close', () => queue.cancel(task))

    return queue.run(task)

    async function task(signal: AbortSignal, attempt = 1): Promise<ECSession | typeof queue.pause> {
      // do not start the task if it is already aborted
      if (signal.aborted) return queue.pause

      const proxyResponse = await req(request.url!, {
        baseUrl: session.serverUrl,
        body: requestBody,
        io: {request, response, handle: false},
        // TODO uncomment when we can throw different abort reasons for task cancelation and timeout abortion
        // signal,
        logger,
      })

      const responseBody: any = await proxyResponse.json()

      logger.log(`Response was intercepted with body:`, responseBody)

      if (['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_DRIVER_POD'].includes(responseBody.value?.data?.appliErrorCode)) {
        queue.cork()
        // after query is corked the task might be aborted
        if (signal.aborted) return queue.pause
        await utils.general.sleep(RETRY_BACKOFF[Math.min(attempt, RETRY_BACKOFF.length - 1)])
        logger.log(
          `Attempt (${attempt}) to create session was failed with applitools status code:`,
          responseBody.value.data.appliErrorCode,
        )
        return task(signal, attempt + 1)
      } else {
        queue.uncork()
        if (responseBody.value) {
          responseBody.value.capabilities ??= {}
          responseBody.value.capabilities['applitools:isECClient'] = true
          if (proxyResponse.headers.has('content-length')) {
            proxyResponse.headers.set('content-length', Buffer.byteLength(JSON.stringify(responseBody)).toString())
          }
          session.sessionId = responseBody.value.sessionId
          session.capabilities = responseBody.value.capabilities
        }
        response
          .writeHead(proxyResponse.status, Object.fromEntries(proxyResponse.headers.entries()))
          .end(JSON.stringify(responseBody))
        return session
      }
    }
  }
}
