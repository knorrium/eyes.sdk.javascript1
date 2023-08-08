import type {ServerSocket} from './types'
import {makeSocket, type Socket} from '@applitools/socket'
import {default as wdSpec, type SpecType as WDSpecType} from '@applitools/spec-driver-webdriver'
import {makeSpec, type SpecType as CustomSpecType} from './spec-driver'
import {makeServer, type ServerOptions} from './ws-server'
import {makeLogger} from '@applitools/logger'
import {makeCore as makeMainCore} from '../core'
import {makeRefer} from './refer'
import {withHistory} from './history'
import os from 'os'
import path from 'path'

export type Options = ServerOptions & {
  environment?: Record<string, any>
  debug?: boolean
  shutdownMode?: 'lazy' | 'stdin'
  idleTimeout?: number
  printStdout?: boolean
  isProcess?: boolean
}

export async function makeCoreServer({
  environment: defaultEnvironment,
  debug = false,
  shutdownMode = 'lazy',
  idleTimeout = 900000, // 15min
  printStdout = false,
  isProcess = false,
  ...handlerOptions
}: Options = {}): Promise<{port: number; close?: () => void}> {
  const logDirname = process.env.APPLITOOLS_LOG_DIR ?? path.resolve(os.tmpdir(), `applitools-logs`)
  const baseLogger = makeLogger({
    handler: {type: 'rolling file', name: 'universal', dirname: logDirname},
    level: 'info',
    format: {label: 'core-universal', colors: false},
  })
  baseLogger.log('Core universal is going to be initialized with options', {
    debug,
    shutdownMode,
    idleTimeout,
    printStdout,
    defaultEnvironment,
    ...handlerOptions,
  })
  const {server, port} = await makeServer({...handlerOptions, debug})
  if (isProcess) {
    // eslint-disable-next-line no-console
    console.log(port) // NOTE: this is a part of the generic protocol
    process.send?.({name: 'port', payload: {port}}) // NOTE: this is a part of the js specific protocol
  }
  if (!server) {
    baseLogger.console.log(`You are trying to spawn a duplicated server, use the server on port ${port} instead`)
    return {port}
  }
  if (!printStdout) process.stdout.write = () => true // NOTE: prevent any write to stdout

  baseLogger.log('Core universal is started on port', port)

  let idle: any
  let serverClosed = false
  if (shutdownMode === 'stdin') {
    process.stdin.resume()
    process.stdin.on('end', () => {
      server.close()
    })
  } else if (shutdownMode === 'lazy') {
    if (idleTimeout) {
      idle = setTimeout(() => server.close(), idleTimeout)
    }
  }

  server.on('close', () => {
    clearTimeout(idle)
    serverClosed = true
  })

  server.on('connection', async client => {
    const refer = makeRefer()
    const socket = makeSocket(client as any, {
      transport: 'ws',
      logger: baseLogger,
    }) as ServerSocket<CustomSpecType | WDSpecType, 'classic' | 'ufg'> & Socket<typeof client>
    const getHistory = debug ? withHistory(socket) : () => null

    if (shutdownMode === 'lazy' && idleTimeout) {
      clearTimeout(idle)
      socket.on('close', () => {
        if (server.clients.size > 0 || serverClosed) return
        idle = setTimeout(() => server.close(), idleTimeout)
      })
    }

    const logger = baseLogger.extend({
      console: {
        log: (message: string) => socket.emit('Logger.log', {level: 'info', message}),
        warn: (message: string) => socket.emit('Logger.log', {level: 'warn', message}),
        error: (message: string) => socket.emit('Logger.log', {level: 'error', message}),
        fatal: (message: string) => socket.emit('Logger.log', {level: 'fatal', message}),
      },
    })

    logger.console.log(`Logs saved in: ${logDirname}`)

    const corePromise = socket.wait('Core.makeCore', ({spec, agentId, environment, cwd}) => {
      return makeMainCore<CustomSpecType | WDSpecType>({
        spec: spec === 'webdriver' ? wdSpec : makeSpec({socket, spec}),
        agentId: `eyes-universal/${require('../../package.json').version}/${agentId}`,
        cwd,
        environment: {
          ...defaultEnvironment,
          ...environment,
          versions: {...defaultEnvironment?.versions, ...environment?.versions},
          universal: true,
        },
        logger,
      })
    })

    socket.command('Core.getAccountInfo', async options => {
      const core = await corePromise
      return core.getAccountInfo(options)
    })
    socket.command('Core.getViewportSize', async options => {
      const core = await corePromise
      return core.getViewportSize?.(options)
    })
    socket.command('Core.setViewportSize', async options => {
      const core = await corePromise
      return core.setViewportSize?.(options)
    })
    socket.command('Core.closeBatch', async options => {
      const core = await corePromise
      return core.closeBatch(options)
    })
    socket.command('Core.deleteTest', async options => {
      const core = await corePromise
      return core.deleteTest(options)
    })
    socket.command('Core.logEvent', async ({settings}) => {
      const core = await corePromise
      return core.logEvent({settings})
    })
    socket.command('Core.locate', async options => {
      const core = await corePromise
      return core.locate(options)
    })
    socket.command('Core.locateText', async options => {
      const core = await corePromise
      return core.locateText(options)
    })
    socket.command('Core.extractText', async options => {
      const core = await corePromise
      return core.extractText(options)
    })
    socket.command('Core.getECClient', async options => {
      const core = await corePromise
      const client = await core.getECClient(options)
      return {url: client.url} as any
    })
    // TODO remove
    socket.command('Core.makeECClient', async options => {
      const core = await corePromise
      const client = await core.getECClient(options)
      return {url: client.url} as any
    })
    socket.command('Core.makeManager', async options => {
      const core = await corePromise
      options.settings ??= {}
      options.settings.concurrency ??= (options as any).concurrency
      options.settings.legacyConcurrency ??= (options as any).legacyConcurrency
      options.settings.agentId ??= (options as any).agentId
      return refer.ref(await core.makeManager(options))
    })

    socket.command('EyesManager.openEyes', async ({manager, ...options}) => {
      const eyes = await refer.deref(manager)?.openEyes(options)
      const eyesRef = refer.ref(eyes, manager)
      return eyesRef
    })
    socket.command('EyesManager.getResults', async ({manager, ...options}) => {
      return refer.deref(manager)?.getResults(options)
    })

    socket.command('Eyes.check', async ({eyes, ...options}) => {
      return refer.deref(eyes)?.check(options)
    })
    socket.command('Eyes.checkAndClose', async ({eyes, ...options}) => {
      return refer.deref(eyes)?.checkAndClose(options)
    })
    socket.command('Eyes.close', async ({eyes, ...options}) => {
      return refer.deref(eyes)?.close(options)
    })
    socket.command('Eyes.abort', async ({eyes, ...options}) => {
      return refer.deref(eyes)?.abort(options)
    })
    socket.command('Eyes.getResults', async ({eyes, ...options}) => {
      return refer.deref(eyes)?.getResults(options)
    })

    socket.command('Debug.getHistory', async () => {
      return getHistory()
    })
  })

  return {port, close: () => server.close()}
}
