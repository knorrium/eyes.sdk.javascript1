import * as promises from './promises'
import * as types from './types'

export interface CorkableQueue<TResult, TAbortController extends AbortController> {
  readonly corked: boolean
  readonly pause: typeof pause
  run(task: Task<TResult, TAbortController['signal']>): Promise<TResult>
  cancel(task: Task<TResult, TAbortController['signal']>): void
  cork(): void
  uncork(): void
}

interface Handle<TResult> {
  running: boolean
  start(): void
  abort(reason?: any): void
  promise: PromiseLike<TResult> & {resolve(value: TResult): void; reject(reason?: any): void}
  controller?: AbortController
}

interface AbortController {
  readonly signal: AbortSignal
  abort(): void
}

interface AbortSignal {
  readonly aborted: boolean
}

type Task<TResult, TAbortSignal extends AbortSignal> = (signal: TAbortSignal) => Promise<TResult | typeof pause>

const pause = Symbol('queue pause')

export function makeCorkableQueue<TResult, TAbortController extends AbortController>(options: {
  makeAbortController(): TAbortController
}): CorkableQueue<TResult, TAbortController> {
  const handles = new Map<Task<TResult, TAbortController['signal']>, Handle<TResult>>()
  let corked = false

  return {
    get corked() {
      return corked
    },
    pause,
    run,
    cancel,
    cork,
    uncork,
  }

  async function run(task: Task<TResult, TAbortController['signal']>): Promise<TResult> {
    const handle: Handle<TResult> = {
      running: false,
      async start() {
        if (handle.running) return
        handle.running = true
        handle.controller = options.makeAbortController()
        try {
          const result = await task(handle.controller.signal)
          if (handle.running && result !== pause) {
            handles.delete(task)
            handle.promise.resolve(result)
          }
        } catch (error) {
          if (handle.running || !types.instanceOf(error, 'AbortError')) handle.promise.reject(error)
        } finally {
          return handle.promise
        }
      },
      abort() {
        if (!handle.running) return
        handle.running = false
        handle.controller!.abort()
      },
      promise: promises.makeControlledPromise<TResult>(),
    }

    handles.set(task, handle)
    if (!corked) handle.start()
    return handle.promise
  }

  function cancel(task: Task<TResult, TAbortController['signal']>): void {
    const handle = handles.get(task)
    if (!handle?.running) return
    handle.abort()
    handles.delete(task)
  }

  function cork() {
    if (corked) return
    corked = true
    Array.from(handles.values())
      .slice(1)
      .forEach(handle => handle.abort())
  }

  function uncork() {
    if (!corked) return
    corked = false
    handles.forEach(handle => handle.start())
  }
}
