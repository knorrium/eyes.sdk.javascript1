import type {Ref} from './types'
import {type Socket} from '@applitools/socket'

type GroupHistory = {
  manager: Ref
  eyes: (Ref | Error)[]
}

type TestHistory = {
  driver: Record<string, any>
  config: Record<string, any>
  commands: {name: string; input: Record<string, any>; result: any}[]
  result: Record<string, any>
  closed: boolean
  aborted: boolean
}

//TODO Design a better history tracker
export function withHistory<TSocket extends Socket>(socket: TSocket): () => Record<string, any> {
  const history = {
    managers: new Map<string, GroupHistory>(),
    eyes: new Map<string, TestHistory>(),
    startedAt: new Date().toISOString(),
  }

  const originalCommand = socket.command
  socket.command = function command(name, fn) {
    return originalCommand(name, async payload => {
      let result, error
      try {
        result = await fn(payload)
        return result
      } catch (err: any) {
        error = err
        throw error
      } finally {
        if (name === 'Core.makeManager') {
          const managerRef = result
          history.managers.set(extractRefId(managerRef), {...payload, manager: result, eyes: []})
        } else if (name.startsWith('EyesManager.')) {
          const managerRef = payload.manager
          const managerHistory = history.managers.get(extractRefId(managerRef))
          if (managerHistory) {
            if (name === 'EyesManager.openEyes') {
              if (error) {
                managerHistory.eyes.push({...payload, error})
              } else {
                const eyesRef = result
                managerHistory!.eyes.push(eyesRef)
                history.eyes.set(extractRefId(eyesRef), {...payload, eyes: eyesRef, commands: []})
              }
            }
          }
        } else if (name.startsWith('Eyes.')) {
          const eyesRef = payload.eyes
          const eyesHistory = history.eyes.get(extractRefId(eyesRef))
          if (eyesHistory) {
            if (name === 'Eyes.check') {
              const command = {name, ...payload}
              if (error) command.error = error
              else command.result = result
              eyesHistory.commands.push(command)
            } else if (name === 'Eyes.close') {
              eyesHistory.closed = true
            } else if (name === 'Eyes.abort') {
              eyesHistory.aborted = true
            } else if (name === 'Eyes.getResults') {
              eyesHistory.result = error ?? result
            }
          }
        }
      }
    })
  }

  return function getHistory() {
    return {
      managers: Array.from(history.managers.values(), managerMeta => ({
        ...managerMeta,
        eyes: managerMeta.eyes.map(eyesRefOrError => {
          return eyesRefOrError instanceof Error ? eyesRefOrError : history.eyes.get(extractRefId(eyesRefOrError))
        }),
      })),
      startedAt: history.startedAt,
      requestedAt: new Date().toISOString(),
    }
  }

  function extractRefId(ref: Ref): string {
    return ref['applitools-ref-id']
  }
}
