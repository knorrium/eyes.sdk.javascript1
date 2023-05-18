import type {TunnelClient, TunnelClientSettings, Tunnel, TunnelCredentials} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeReq} from '@applitools/req'
//@ts-ignore
import {startEgTunnelService} from '@applitools/execution-grid-tunnel'
import * as utils from '@applitools/utils'

export function makeTunnelClient({
  settings,
  logger: defaultLogger,
}: {
  settings: TunnelClientSettings
  logger?: Logger
}): TunnelClient {
  const logger = makeLogger({logger: defaultLogger, format: {label: 'tunnel-client'}})
  const getTunnelService = utils.general.cachify(async () => {
    if (settings.serviceUrl) {
      return {serviceUrl: settings.serviceUrl, close: async () => undefined}
    }
    const {port, cleanupFunction} = await startEgTunnelService({logger})
    return {
      url: `http://localhost:${port}`,
      async close() {
        await cleanupFunction()
        getTunnelService.clearCache()
      },
    }
  })
  const req = makeReq({
    retry: {
      validate: async ({response}) => {
        if (!response) return false
        const body: any = await response
          .clone()
          .json()
          .catch(() => null)
        return ['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_TUNNEL_PROXY'].includes(body?.message)
      },
      timeout: [
        ...Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
        ...Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
        10000, // all next tries with delay 10s
      ],
    },
  })

  return {list, create, destroy, replace, close}

  async function list(): Promise<Tunnel[]> {
    const service = await getTunnelService()

    const response = await req('/tunnels', {
      method: 'GET',
      baseUrl: service.url,
    })

    const body: any = await response.json().catch(() => null)
    if (response.status === 200) return body.map((tunnelId: string) => ({tunnelId} as Tunnel))

    logger.error(`Failed to create tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`)
    throw new Error(`Failed to create tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
  }

  async function create(credentials: TunnelCredentials): Promise<Tunnel> {
    const service = await getTunnelService()

    const response = await req('/tunnels', {
      method: 'POST',
      baseUrl: service.url,
      headers: {
        'x-eyes-api-key': credentials.apiKey,
        'x-eyes-server-url': credentials.eyesServerUrl,
      },
    })

    const body: any = await response.json().catch(() => null)
    if (response.status === 201) return {tunnelId: body, credentials}

    logger.error(`Failed to create tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`)
    throw new Error(`Failed to create tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
  }

  async function replace(tunnel: Tunnel): Promise<Tunnel> {
    await destroy(tunnel)
    return create(tunnel.credentials)
  }

  async function destroy(tunnel: Tunnel): Promise<void> {
    const service = await getTunnelService()

    const response = await req(`/tunnels/${tunnel.tunnelId}`, {
      method: 'DELETE',
      baseUrl: service.url,
      headers: {
        'x-eyes-api-key': tunnel.credentials.apiKey,
        'x-eyes-server-url': tunnel.credentials.eyesServerUrl,
      },
    })

    const body: any = await response.json().catch(() => null)
    if (response.status === 200) return

    logger.error(`Failed to delete tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`)
    throw new Error(`Failed to delete tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
  }

  async function close(): Promise<void> {
    const service = await getTunnelService()

    await service.close()
  }
}
