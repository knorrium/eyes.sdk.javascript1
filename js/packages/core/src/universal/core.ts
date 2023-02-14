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
  return {
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
      const eyes = await socket.request('Core.openEyes', options)
      return makeEyes({socket, eyes})
    },
    async makeManager(options) {
      const socket = await socketPromise
      const manager = await socket.request('Core.makeManager', options)
      return makeManager({socket, manager})
    },
    async makeECClient(options) {
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
}

export function makeManager<TSpec extends SpecType, TType extends 'classic' | 'ufg'>({
  socket,
  manager,
}: {
  socket: ClientSocket<TSpec, TType>
  manager: Ref<EyesManager<TSpec, TType>>
}): EyesManager<TSpec, TType> {
  return {
    async openEyes(options) {
      const eyes = await socket.request('EyesManager.openEyes', {...options, manager})
      return makeEyes({socket, eyes})
    },
    async getResults(options) {
      return socket.request('EyesManager.getResults', {...options, manager})
    },
  }
}

export function makeEyes<TSpec extends SpecType, TType extends 'classic' | 'ufg'>({
  socket,
  eyes,
}: {
  socket: ClientSocket<TSpec, TType>
  eyes: Ref<Eyes<TSpec, TType>>
}): Eyes<TSpec, TType> {
  return {
    test: null as never,
    running: null as never,
    getBaseEyes() {
      return null as never
    },
    getTypedEyes() {
      return null as never
    },
    async check(options) {
      return socket.request('Eyes.check', {...options, eyes}) as any
    },
    async checkAndClose(options) {
      return socket.request('Eyes.checkAndClose', {...options, eyes}) as any
    },
    async close(options) {
      return socket.request('Eyes.close', {...options, eyes})
    },
    async abort(options) {
      return socket.request('Eyes.abort', {...options, eyes})
    },
    async getResults(options) {
      return socket.request('Eyes.getResults', {...options, eyes}) as any
    },
  }
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
