import {type Logger} from '@applitools/logger'
import {makeReq} from '@applitools/req'
//@ts-ignore
import makeTunnel from '@applitools/eg-tunnel'

export interface TunnelManager {
  create(options: {eyesServerUrl: string; apiKey: string}): Promise<{tunnelId: string}>
  destroy(options: {tunnelId: string; eyesServerUrl: string; apiKey: string}): Promise<void>
}

export type TunnelManagerSettings = {tunnelUrl?: string}

export async function makeTunnelManager({
  settings,
  logger,
}: {
  settings?: TunnelManagerSettings
  logger: Logger
}): Promise<TunnelManager & {cleanup(): Promise<void>}> {
  let cleanup = () => Promise.resolve()
  if (!settings || !settings?.tunnelUrl) {
    const tunnelServer = await makeTunnel({logger: null})
    settings ??= {}
    settings.tunnelUrl = `http://0.0.0.0:${tunnelServer.port}`
    cleanup = tunnelServer.cleanupFunction
  }
  const req = makeReq({
    baseUrl: settings?.tunnelUrl,
    retry: {
      validate: async ({response}) => {
        if (!response) return false
        const body = await response
          .clone()
          .json()
          .catch(() => null)
        return (
          ['CONCURRENCY_LIMIT_REACHED', 'NO_AVAILABLE_TUNNEL_PROXY'].includes(body?.message) ||
          (response.status >= 400 && response.status < 500)
        )
      },
      timeout: [
        ...Array(5).fill(2000), // 5 tries with delay 2s (total 10s)
        ...Array(4).fill(5000), // 4 tries with delay 5s (total 20s)
        10000, // all next tries with delay 10s
      ],
    },
  })

  return {create, destroy, cleanup}

  async function create({eyesServerUrl, apiKey}: {eyesServerUrl: string; apiKey: string}): Promise<{tunnelId: string}> {
    const response = await req('/tunnels', {
      method: 'POST',
      headers: {
        'x-eyes-api-key': apiKey,
        'x-eyes-server-url': eyesServerUrl,
      },
    })

    const body = await response.json().catch(() => null)
    if (response.status === 201) return {tunnelId: body}

    logger.error(`Failed to create tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`)
    throw new Error(`Failed to create tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
  }

  async function destroy({
    tunnelId,
    eyesServerUrl,
    apiKey,
  }: {
    tunnelId: string
    eyesServerUrl: string
    apiKey: string
  }): Promise<void> {
    const response = await req(`/tunnels/${tunnelId}`, {
      method: 'DELETE',
      headers: {
        'x-eyes-api-key': apiKey,
        'x-eyes-server-url': eyesServerUrl,
      },
    })

    const body = await response.json().catch(() => null)
    if (response.status === 200) return

    logger.error(`Failed to delete tunnel with status ${response.status} and code ${body?.message ?? 'UNKNOWN_ERROR'}`)
    throw new Error(`Failed to delete tunnel with code ${body?.message ?? 'UNKNOWN_ERROR'}`)
  }
}
