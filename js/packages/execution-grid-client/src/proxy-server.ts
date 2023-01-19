import type {EGClient, EGClientSettings} from './types'
import {type AddressInfo} from 'net'
import {type AbortSignal} from 'abort-controller'
import {createServer, type IncomingMessage, type ServerResponse} from 'http'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeQueue, type Queue} from './queue'
import {makeTunnelManager, type Tunnel} from './tunnels/manager'
import {makeTunnelManagerClient} from './tunnels/manager-client'
import {makeReqProxy} from './req-proxy'
import * as utils from '@applitools/utils'

const RETRY_BACKOFF = [
  ...Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
  ...Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
  10000, // all next tries with delay 10s
]

const RETRY_ERROR_CODES = ['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_DRIVER_POD']

interface Session {
  credentials: {
    eyesServerUrl: string
    apiKey: string
  }
  tunnels?: Tunnel[]
  metadata?: any[]
}

export async function makeServer({settings, logger}: {settings: EGClientSettings; logger?: Logger}): Promise<EGClient> {
  const serverLogger = logger ? logger.extend({label: 'eg-client'}) : makeLogger({label: 'eg-client', colors: true})

  const req = makeReqProxy({
    targetUrl: settings.serverUrl,
    proxy: settings.proxy,
    retry: {
      validate: async ({response, error}) => {
        if (error) return !utils.types.instanceOf(error, 'AbortError')
        if (response) return response.status >= 500 && !utils.types.has(await response.clone().json(), 'value')
        return false
      },
      limit: 10,
      timeout: 5000,
    },
  })

  const tunnelManager = settings.tunnel?.serverUrl
    ? await makeTunnelManager({settings: settings.tunnel, logger: serverLogger})
    : await makeTunnelManagerClient({settings: settings.tunnel})

  const sessions = new Map<string, Session>()
  const queues = new Map<string, Queue>()

  const server = createServer(async (request, response) => {
    const url = request.url as string
    const requestLogger = serverLogger.extend({
      tags: {request: `[${request.method}] ${request.url}`, requestId: utils.general.guid()},
    })

    try {
      if (request.method === 'POST' && /^\/session\/?$/.test(url)) {
        return await createSession({request, response, logger: requestLogger})
      } else if (request.method === 'DELETE' && /^\/session\/[^\/]+\/?$/.test(url)) {
        return await deleteSession({request, response, logger: requestLogger})
      } else if (request.method === 'POST' && /^\/session\/[^\/]+\/element\/?$/.test(url)) {
        requestLogger.log('Inspecting element lookup request to collect self-healing metadata')
        const proxyResponse = await req(url, {io: {request, response, handle: false}, logger: requestLogger})
        const responseBody = await proxyResponse.json()
        if (responseBody?.appliCustomData?.selfHealing?.successfulSelector) {
          requestLogger.log('Self-healed locators detected', responseBody.appliCustomData.selfHealing)
          const session = sessions.get(getSessionId(url))!
          session.metadata ??= []
          session.metadata.push(responseBody.appliCustomData.selfHealing)
        } else {
          requestLogger.log('No self-healing metadata found')
        }
        response.end(JSON.stringify(responseBody))
      } else if (request.method === 'GET' && /^\/session\/[^\/]+\/applitools\/metadata?$/.test(url)) {
        const session = sessions.get(getSessionId(url))!
        requestLogger.log('Session metadata requested, returning', session.metadata)
        response.writeHead(200).end(JSON.stringify({value: session.metadata}))
        session.metadata = undefined
      } else if (request.method === 'GET' && /^\/session\/[^\/]+\/?$/.test(url)) {
        const sessionDetails = {sessionId: getSessionId(url), applitools: true}
        requestLogger.log('Session details requested, returning', sessionDetails)
        response.writeHead(200).end(JSON.stringify({value: sessionDetails}))
      } else {
        requestLogger.log('Passthrough request')
        return await req(url, {io: {request, response}, logger: requestLogger})
      }
    } catch (err: any) {
      requestLogger.error(`Error during processing request:`, err)
      if (!response.writableEnded) {
        response
          .writeHead(500)
          .end(JSON.stringify({value: {error: 'internal proxy server error', message: err.message, stacktrace: ''}}))
      }
    } finally {
      requestLogger.log(`Request was responded with status ${response.statusCode}`)
    }
  })

  server.listen(settings.port ?? 0)

  return new Promise<{url: string; port: number; close(): void}>((resolve, reject) => {
    server.on('listening', () => {
      const address = server.address() as AddressInfo
      serverLogger.log(`Proxy server has started on port ${address.port}`)
      resolve({
        url: `http://localhost:${address.port}`,
        port: address.port,
        close: () => server.close(),
      })
    })
    server.on('error', async (err: Error) => {
      serverLogger.fatal('Error starting proxy server', err)
      reject(err)
    })
  })

  async function createSession({
    request,
    response,
    logger,
  }: {
    request: IncomingMessage
    response: ServerResponse
    logger: Logger
  }): Promise<void> {
    const requestBody = await utils.streams.toJSON(request)

    logger.log(`Request was intercepted with body:`, requestBody)

    const session = {credentials: {}} as Session
    session.credentials.eyesServerUrl =
      extractCapability(requestBody, 'applitools:eyesServerUrl') ??
      extractCapability(requestBody, 'applitools:options')?.eyesServerUrl ??
      settings.capabilities?.eyesServerUrl
    session.credentials.apiKey =
      extractCapability(requestBody, 'applitools:apiKey') ??
      extractCapability(requestBody, 'applitools:options')?.apiKey ??
      settings.capabilities?.apiKey
    if (
      extractCapability(requestBody, 'applitools:tunnel') ??
      extractCapability(requestBody, 'applitools:options')?.tunnel
    ) {
      session.tunnels = await tunnelManager.acquire(session.credentials)
    }

    const applitoolsCapabilities = {
      'applitools:eyesServerUrl': session.credentials.eyesServerUrl,
      'applitools:apiKey': session.credentials.apiKey,
      ...session.tunnels?.reduce((caps, tunnel, index) => {
        caps[`applitools:x-tunnel-id-${index}`] = tunnel.tunnelId
        return caps
      }, {} as Record<`applitools:x-tunnel-id-${number}`, string>),
      'applitools:timeout':
        extractCapability(requestBody, 'applitools:timeout') ??
        extractCapability(requestBody, 'applitools:options')?.timeout ??
        settings.capabilities?.timeout,
      'applitools:inactivityTimeout':
        extractCapability(requestBody, 'applitools:inactivityTimeout') ??
        extractCapability(requestBody, 'applitools:options')?.inactivityTimeout ??
        settings.capabilities?.inactivityTimeout,
      'applitools:useSelfHealing':
        extractCapability(requestBody, 'applitools:useSelfHealing') ??
        extractCapability(requestBody, 'applitools:options')?.useSelfHealing ??
        settings.capabilities?.useSelfHealing,
    }

    if (requestBody.capabilities) {
      requestBody.capabilities.alwaysMatch = {...requestBody.capabilities?.alwaysMatch, ...applitoolsCapabilities}
    }
    if (requestBody.desiredCapabilities) {
      requestBody.desiredCapabilities = {...requestBody.desiredCapabilities, ...applitoolsCapabilities}
    }

    logger.log('Request body has modified:', requestBody)

    const queueKey = JSON.stringify(session.credentials)
    let queue = queues.get(queueKey)!
    if (!queue) {
      queue = makeQueue({logger: logger.extend({tags: {queue: queueKey}})})
      queues.set(queueKey, queue)
    }

    request.socket.on('close', () => queue.cancel(task))

    await queue.run(task)

    async function task(signal: AbortSignal, attempt = 1): Promise<void> {
      // do not start the task if it is already aborted
      if (signal.aborted) return

      const proxyResponse = await req(request.url as string, {
        body: requestBody,
        io: {request, response, handle: false},
        // TODO uncomment when we can throw different abort reasons for task cancelation and timeout abortion
        // signal,
        logger,
      })

      const responseBody = await proxyResponse.json()

      logger.log(`Response was intercepted with body:`, responseBody)

      if (RETRY_ERROR_CODES.includes(responseBody.value?.data?.appliErrorCode)) {
        queue.cork()
        // after query is corked the task might be aborted
        if (signal.aborted) return
        await utils.general.sleep(RETRY_BACKOFF[Math.min(attempt, RETRY_BACKOFF.length - 1)])
        logger.log(
          `Attempt (${attempt}) to create session was failed with applitools status code:`,
          responseBody.value.data.appliErrorCode,
        )
        return task(signal, attempt + 1)
      } else {
        queue.uncork()
        if (responseBody.value?.sessionId) sessions.set(responseBody.value.sessionId, session)
        response.end(JSON.stringify(responseBody))
        return
      }
    }
  }

  async function deleteSession({
    request,
    response,
    logger,
  }: {
    request: IncomingMessage
    response: ServerResponse
    logger: Logger
  }): Promise<void> {
    const url = request.url as string
    const sessionId = getSessionId(url)
    logger.log(`Request was intercepted with sessionId:`, sessionId)

    await req(url, {io: {request, response}, logger})

    const session = sessions.get(sessionId)!
    if (session.tunnels) {
      await tunnelManager.release(session.tunnels)
      logger.log(
        `Tunnels with id ${session.tunnels.map(
          tunnel => tunnel.tunnelId,
        )} was released for session with id ${sessionId}`,
      )
    }
    sessions.delete(sessionId)
  }

  function extractCapability(
    data: {
      desiredCapabilities?: Record<string, any>
      capabilities?: {alwaysMatch?: Record<string, any>; firstMatch?: Record<string, any>[]}
    },
    capabilityName: string,
  ): any {
    return data.capabilities?.alwaysMatch?.[capabilityName] ?? data.desiredCapabilities?.[capabilityName]
  }
}

function getSessionId(requestUrl: string): string {
  return requestUrl?.split('/')[2] ?? ''
}
