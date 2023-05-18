import {type Transport} from '../transport'

export type Data = any

type GeneratorHandler = {
  queue: Data[]
  readyListener?: () => void
  messageListener?: (message: Data) => void
  closeListener?: () => void
  errorListener?: (reason: any) => void
}

export function makeTransport(): Transport<AsyncGenerator<Data[], Data[], Data[]>, Data> {
  const generators = new Map<AsyncGenerator<Data, Data>, GeneratorHandler>()

  return {
    isReady(generator) {
      handle(generator)
      return true
    },
    onReady(generator, callback) {
      handle(generator)
      const handler = generators.get(generator)!
      handler.readyListener = callback
      return () => (handler.readyListener = undefined)
    },
    onMessage(generator, callback) {
      handle(generator)
      const handler = generators.get(generator)!
      handler.messageListener = callback
      return () => (handler.messageListener = undefined)
    },
    onClose(generator, callback) {
      handle(generator)
      const handler = generators.get(generator)!
      handler.closeListener = callback
      return () => (handler.closeListener = undefined)
    },
    onError(generator, callback) {
      handle(generator)
      const handler = generators.get(generator)!
      handler.errorListener = callback
      return () => (handler.errorListener = undefined)
    },
    send(generator, data) {
      handle(generator)
      const handler = generators.get(generator)!
      handler.queue.push(data)
    },
  }

  async function handle(generator: AsyncGenerator<Data[], Data[], Data[]>) {
    if (generators.get(generator)) return

    const handler = {queue: []} as GeneratorHandler
    generators.set(generator, handler)
    let running = true
    handler.readyListener?.()
    while (running) {
      try {
        const result = await generator.next(handler.queue)
        handler.queue = []
        result.value.forEach(value => handler.messageListener?.(value))
        if (result.done) {
          running = false
          handler.closeListener?.()
        }
      } catch (error) {
        running = false
        handler.errorListener?.(error)
      }
    }
  }
}

export const transport = makeTransport()

export default transport
