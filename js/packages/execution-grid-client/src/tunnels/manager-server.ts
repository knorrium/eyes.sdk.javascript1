import type {TunnelManagerSettings} from '../types'
import {type Tunnel} from '@applitools/tunnel-client'
import {createServer, type Server} from 'net'
import {makeLogger} from '@applitools/logger'
import {makeSocket, type Socket} from '@applitools/socket'
import {makeTunnelManager} from './manager'
import {fork} from 'child_process'
import * as path from 'path'
import * as os from 'os'

const LOG_DIRNAME = process.env.APPLITOOLS_LOG_DIR ?? path.resolve(os.tmpdir(), `applitools-tunnel-logs`)

export type TunnelManagerServer = {
  close(): Promise<void>
}

export type TunnelManagerServerOptions = {
  settings?: TunnelManagerSettings
  idleTimeout?: number
  path: string
  unlink?: boolean
}

export async function makeTunnelManagerServer({
  settings,
  path,
  idleTimeout = 600_000, // 10min
}: TunnelManagerServerOptions): Promise<TunnelManagerServer> {
  const server = await new Promise<Server>((resolve, reject) => {
    const server = createServer().listen({path})
    server.on('error', error => reject(error))
    server.on('listening', () => resolve(server))
  })
  const logger = makeLogger({
    handler: {type: 'rolling file', name: 'ec-tunnel-manager', dirname: LOG_DIRNAME},
    level: 'info',
    format: {
      label: 'ec-tunnel-manager',
      colors: false,
    },
  })
  logger.log('Server is started')
  const manager = await makeTunnelManager({settings, logger})

  process.send?.({name: 'started', payload: {path}}) // NOTE: this is a part of the js specific protocol

  let idle: NodeJS.Timeout | void
  let serverClosed = false
  if (idleTimeout) idle = setTimeout(close, idleTimeout)

  server.on('close', () => {
    if (idle) clearTimeout(idle)
    serverClosed = true
  })

  const sockets = new Set<Socket>()
  server.on('connection', client => {
    const store = new Map<string, Tunnel[]>()
    if (idle) idle = clearTimeout(idle)
    const socket = makeSocket(client, {transport: 'ipc', logger})
    sockets.add(socket)
    socket.on('close', async () => {
      logger.log('Connection is closed, remaining tunnels are going to be released')
      sockets.delete(socket)
      await Promise.all(Array.from(store.values(), manager.release)).catch(logger.error)
      if (sockets.size === 0 && !serverClosed) idle = setTimeout(close, idleTimeout)
    })

    socket.command('Tunnel.acquire', async credentials => {
      const tunnels = await manager.acquire(credentials)
      store.set(JSON.stringify(tunnels), tunnels)
      return tunnels
    })
    socket.command('Tunnel.release', async tunnels => {
      await manager.release(tunnels)
      store.delete(JSON.stringify(tunnels))
    })
  })

  return {close}

  async function close() {
    logger.log('Server is going to be closed')
    server.close()
    await manager.close()
    process.kill(0)
  }
}

export async function makeTunnelManagerServerProcess(
  options: TunnelManagerServerOptions,
): Promise<TunnelManagerServer> {
  return new Promise((resolve, reject) => {
    const server = fork(
      path.resolve(__dirname, '../../dist/cli/cli.js'),
      [`tunnel-manager`, `--config=${JSON.stringify(options)}`],
      {
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
        detached: true,
      },
    )

    const timeout = setTimeout(() => {
      reject(new Error(`Server didn't respond for 10s after being started`))
      server.kill()
    }, 5000)

    server.on('error', reject)
    server.once('message', ({name}: {name: string}) => {
      if (name === 'started') {
        resolve({close: async () => void server.kill()})
        clearTimeout(timeout)
        server.channel!.unref()
      }
    })

    server.unref()
  })
}
