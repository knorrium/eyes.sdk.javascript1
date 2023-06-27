import type {TunnelManagerSettings} from '../types'
import {type TunnelManager} from './manager'
import {makeTunnelManagerServerProcess, type TunnelManagerServer} from './manager-server'
import {makeSocket} from '@applitools/socket'
import {promises as fs} from 'fs'
import {createConnection} from 'net'

export async function makeTunnelManagerClient({
  settings,
}: {
  settings?: TunnelManagerSettings
} = {}): Promise<TunnelManager & {close(): Promise<void>}> {
  const path =
    process.env.APPLITOOLS_TUNNEL_MANAGER_SOCK ||
    (process.platform === 'win32' ? '\\\\.\\pipe\\applitools-tunnel-manager' : '/tmp/applitools-tunnel-manager.sock')
  const socket = makeSocket(createConnection({path}), {transport: 'ipc'})
  let server: TunnelManagerServer
  socket.once('error', async (error: Error & {code: string}) => {
    try {
      if (['ECONNREFUSED', 'ENOENT'].includes(error.code)) {
        if (error.code === 'ECONNREFUSED') {
          try {
            await fs.unlink(path)
          } catch {}
        }
        server = await makeTunnelManagerServerProcess({settings, path})
      }
    } finally {
      socket.use(createConnection({path}))
    }
  })
  socket.once('ready', () => socket.target.unref())

  return {
    acquire: (options: any) => socket.request('Tunnel.acquire', options),
    release: (options: any) => socket.request('Tunnel.release', options),
    close: () => server?.close(),
  }
}
