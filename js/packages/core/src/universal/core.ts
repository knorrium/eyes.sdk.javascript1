import type {Core, EyesManager, Eyes} from '../types'
import type {ClientSocket, Ref} from './types'
import type {SpecType, SpecDriver} from '@applitools/driver'
import {makeSocket, type Socket} from '@applitools/socket'
import {WebSocket} from 'ws'
import {makeCoreServer} from './core-server'
import * as utils from '@applitools/utils'

//TODO add refer and sanitizing support, solve types issues

export function makeCore<TSpec extends SpecType, TType extends 'classic' | 'ufg'>(options: {
  agentId: string
  spec: 'webdriver' | SpecDriver<TSpec>
}): Core<TSpec, TType> {
  const socketPromise = makeClientSocket(options)
  const core: Core<TSpec, TType> = {
    base: null as never,
    async getAccountInfo(options) {
      const socket = await socketPromise
      return socket.request('Core.getAccountInfo', options)
    },
    async getViewportSize(options) {
      const socket = await socketPromise
      return socket.request('Core.getViewportSize', options)
    },
    async setViewportSize(options) {
      const socket = await socketPromise
      return socket.request('Core.setViewportSize', options)
    },
    async locate(options) {
      const socket = await socketPromise
      return socket.request('Core.locate', options)
    },
    async locateText(options) {
      const socket = await socketPromise
      return socket.request('Core.locateText', options)
    },
    async extractText(options) {
      const socket = await socketPromise
      return socket.request('Core.extractText', options)
    },
    async openEyes(options) {
      const socket = await socketPromise
      const eyesRef = await socket.request('Core.openEyes', options)
      return makeEyes({socket, core, eyesRef})
    },
    async makeManager(options) {
      const socket = await socketPromise
      const managerRef = await socket.request('Core.makeManager', options)
      return makeManager({socket, core, managerRef})
    },
    async getECClient(options) {
      const socket = await socketPromise
      return socket.request('Core.makeECClient', options) as any
    },
    async closeBatch(options) {
      const socket = await socketPromise
      return socket.request('Core.closeBatch', options)
    },
    async deleteTest(options) {
      const socket = await socketPromise
      return socket.request('Core.deleteTest', options)
    },
    async logEvent(options) {
      const socket = await socketPromise
      return socket.request('Core.logEvent', options)
    },
  }
  return core
}

export function makeManager<TSpec extends SpecType, TType extends 'classic' | 'ufg'>({
  socket,
  core,
  managerRef,
}: {
  socket: ClientSocket<TSpec, TType>
  core: Core<TSpec, TType>
  managerRef: Ref<EyesManager<TSpec, TType>>
}): EyesManager<TSpec, TType> {
  const manager: EyesManager<TSpec, TType> = {
    async openEyes(options) {
      const eyesRef = await socket.request('EyesManager.openEyes', {...options, manager: managerRef})
      return makeEyes({socket, core, eyesRef})
    },
    async getResults(options) {
      return socket.request('EyesManager.getResults', {...options, manager: managerRef})
    },
  }
  return manager
}

export function makeEyes<TSpec extends SpecType, TType extends 'classic' | 'ufg'>({
  socket,
  core,
  eyesRef,
}: {
  socket: ClientSocket<TSpec, TType>
  core: Core<TSpec, TType>
  eyesRef: Ref<Eyes<TSpec, TType>>
}): Eyes<TSpec, TType> {
  const eyes: Eyes<TSpec, TType> = {
    test: null as never,
    running: null as never,
    core,
    getBaseEyes() {
      return null as never
    },
    getTypedEyes() {
      return null as never
    },
    async check(options) {
      return socket.request('Eyes.check', {...options, eyes: eyesRef}) as any
    },
    async checkAndClose(options) {
      return socket.request('Eyes.checkAndClose', {...options, eyes: eyesRef}) as any
    },
    async close(options) {
      return socket.request('Eyes.close', {...options, eyes: eyesRef})
    },
    async abort(options) {
      return socket.request('Eyes.abort', {...options, eyes: eyesRef})
    },
    async getResults(options) {
      return socket.request('Eyes.getResults', {...options, eyes: eyesRef}) as any
    },
  }
  return eyes
}

export async function makeClientSocket<TSpec extends SpecType>({
  agentId,
  spec,
}: {
  agentId: string
  spec: 'webdriver' | SpecDriver<TSpec>
}): Promise<ClientSocket<TSpec, 'classic' | 'ufg'> & Socket<WebSocket>> {
  const {port} = await makeCoreServer()
  const socket = makeSocket(new WebSocket(`ws://localhost:${port}/eyes`) as any, {
    transport: 'ws',
  }) as ClientSocket<TSpec, 'classic' | 'ufg'> & Socket<WebSocket>
  socket.emit('Core.makeCore', {
    agentId,
    cwd: process.cwd(),
    spec: utils.types.isString(spec) ? spec : Object.keys(spec),
  })

  if (!utils.types.isString(spec)) {
    Object.entries(spec).forEach(([name, command]) => {
      socket.command(`Driver.${name}`, args => command(...args))
    })
  }

  return socket
}
