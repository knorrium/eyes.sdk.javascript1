import type {TunnelClientWorkerSettings} from './types'
import {makeLogger, type Logger} from '@applitools/logger'
import {makeSocket} from '@applitools/socket'
import {makeTunnelClient} from './client'
import {makeGenerator} from './generator'
import {fetchResource} from './fetch-resource'
import {extractEnvInfo, extractCurrentUsage} from './metrics'
import * as path from 'path'
import * as os from 'os'

const LOG_DIRNAME = process.env.APPLITOOLS_LOG_DIR ?? path.resolve(os.tmpdir(), `applitools-tunnel-client-logs`)

export function makeTunnelClientWorker({
  settings,
  logger: defaultLogger,
}: {
  settings: TunnelClientWorkerSettings
  logger?: Logger
}) {
  const logger = makeLogger({
    logger: defaultLogger,
    handler: {type: 'rolling file', name: 'tunnel-client', dirname: LOG_DIRNAME},
    format: {label: 'tunnel-client', colors: false},
  })
  const client = makeTunnelClient({settings, logger})
  const generator = makeGenerator({settings: {...settings, envInfo: extractEnvInfo()}, logger})
  const socket = makeSocket(generator, {transport: 'generator', logger})
  const interval = setInterval(async () => {
    socket.emit('TunnelClient.list', await client.list())
    socket.emit('TunnelClient.metrics', extractCurrentUsage())
  }, 20_000)

  socket.command('TunnelClient.create', client.create)
  socket.command('TunnelClient.replace', client.replace)
  socket.command('TunnelClient.destroy', client.destroy)
  socket.command('TunnelClient.fetch', fetchResource)

  socket.on('TunnelClient.close', async reason => {
    logger.fatal('Worker is going to be closed due to a reason', reason)
    clearInterval(interval)
    await client.close()
  })
  socket.on('error', async reason => {
    logger.fatal('Worker is going to be closed due to an error', reason)
    clearInterval(interval)
    await client.close()
  })

  return socket
}
