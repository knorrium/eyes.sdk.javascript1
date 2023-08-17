import type {TunnelClient, TunnelClientSettings, Tunnel, TunnelCredentials} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {req} from '@applitools/req'
//@ts-ignore
import {startEgTunnelService} from '@applitools/execution-grid-tunnel'
import {AbortController, type AbortSignal} from 'abort-controller'
import * as utils from '@applitools/utils'

const RETRY_BACKOFF = [
  ...Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
  ...Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
  10000, // all next tries with delay 10s
]

export function makeTunnelClient({
  settings,
  logger: defaultLogger,
}: {
  settings?: TunnelClientSettings
  logger?: Logger
} = {}): TunnelClient {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'tunnel-client'}})

  const tunnelServerUrl =
    settings?.tunnelServerUrl ??
    utils.general.getEnvValue('EXECUTION_CLOUD_URL') ??
    utils.general.getEnvValue('EG_SERVER_URL') ??
    'https://exec-wus.applitools.com'

  const getTunnelService = utils.general.cachify(async (tunnelServerUrl: string) => {
    if (settings?.serviceUrl) {
      return {url: settings.serviceUrl, close: () => Promise.resolve()}
    }
    const {port, cleanupFunction} = await startEgTunnelService({egTunnelManagerUrl: tunnelServerUrl, logger})
    return {
      url: `http://localhost:${port}`,
      async close(): Promise<void> {
        await cleanupFunction()
        getTunnelService.clearCache()
      },
    }
  })

  const tunnels = new Map<string, Tunnel>()
  const queues = new Map<string, utils.queues.CorkableQueue<Tunnel, AbortController>>()

  return {list, create, destroy, replace, close}

  async function list(): Promise<Tunnel[]> {
    const service = await getTunnelService(tunnelServerUrl)

    const response = await req('/tunnels', {
      method: 'GET',
      baseUrl: service.url,
    })

    const body: any = await response.json().catch(() => null)
    if (response.status === 200) return body.map((tunnelId: string) => tunnels.get(tunnelId) ?? ({tunnelId} as Tunnel))

    logger.error(`Failed to create tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`)
    throw new Error(`Failed to create tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
  }

  async function create(credentials: TunnelCredentials): Promise<Tunnel> {
    const service = await getTunnelService(credentials.tunnelServerUrl ?? tunnelServerUrl)

    const queueKey = `${credentials.apiKey}$${credentials.eyesServerUrl}`
    let queue = queues.get(queueKey)!
    if (!queue) {
      queue = utils.queues.makeCorkableQueue({makeAbortController: () => new AbortController()})
      queues.set(queueKey, queue)
    }

    return queue.run(task)

    async function task(signal: AbortSignal, attempt = 1): Promise<Tunnel | typeof queue.pause> {
      if (signal.aborted) return queue.pause

      const response = await req('/tunnels', {
        method: 'POST',
        baseUrl: service.url,
        headers: {
          'x-eyes-api-key': credentials.apiKey,
          'x-eyes-server-url': credentials.eyesServerUrl,
        },
        // TODO uncomment when we can throw different abort reasons for task cancelation and timeout abortion
        // signal,
      })

      const body: any = await response.json().catch(() => null)

      if (['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_TUNNEL_PROXY'].includes(body?.message)) {
        queue.cork()
        // after query is corked the task might be aborted
        if (signal.aborted) return queue.pause
        await utils.general.sleep(RETRY_BACKOFF[Math.min(attempt, RETRY_BACKOFF.length - 1)])
        return task(signal, attempt + 1)
      } else {
        queue.uncork()
        if (response.status === 201) {
          const tunnel = {tunnelId: body, credentials}
          tunnels.set(tunnel.tunnelId, tunnel)
          return tunnel
        }
        logger.error(
          `Failed to create tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`,
        )
        throw new Error(`Failed to create tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
      }
    }
  }

  async function replace(tunnelId: string): Promise<Tunnel> {
    const tunnel = tunnels.get(tunnelId)
    if (!tunnel) {
      logger.error(`Failed to replace tunnel using unknown tunnel id "${tunnelId}"`)
      throw new Error(`Failed to replace tunnel using unknown tunnel id "${tunnelId}"`)
    }
    await destroy(tunnel.tunnelId)
    return create(tunnel.credentials)
  }

  async function destroy(tunnelId: string, options?: {reason?: string}): Promise<void> {
    const tunnel = tunnels.get(tunnelId)
    if (!tunnel) {
      logger.error(`Failed to delete tunnel using unknown tunnel id "${tunnelId}"`)
      throw new Error(`Failed to delete tunnel using unknown tunnel id "${tunnelId}"`)
    }
    const service = await getTunnelService(tunnel.credentials.tunnelServerUrl ?? tunnelServerUrl)

    const response = await req(`/tunnels/${tunnel.tunnelId}`, {
      method: 'DELETE',
      query: {reason: options?.reason},
      baseUrl: service.url,
      headers: {
        'x-eyes-api-key': tunnel.credentials.apiKey,
        'x-eyes-server-url': tunnel.credentials.eyesServerUrl,
      },
    })

    const body: any = await response.json().catch(() => null)
    if (response.status === 200) {
      tunnels.delete(tunnel.tunnelId)
      return
    }

    logger.error(`Failed to delete tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`)
    throw new Error(`Failed to delete tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
  }

  async function close(): Promise<void> {
    try {
      const tunnels = await list()
      logger.log(tunnels)
      await Promise.all(tunnels.map(tunnel => destroy(tunnel.tunnelId, {reason: 'client-closed'})))
      const service = await getTunnelService(tunnelServerUrl)
      await service.close()
    } catch (error) {
      logger.error(`Failed to close tunnel client due to an error`, error)
    }
  }
}
