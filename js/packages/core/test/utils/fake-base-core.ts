import type {AccountInfo, Core, Eyes} from '@applitools/core-base'
import * as utils from '@applitools/utils'
import EventEmitter from 'events'

export function makeFakeCore({
  hooks,
  account = {},
}: {
  hooks?: {
    [TKey in keyof (Core & Eyes)]?: (Core & Eyes)[TKey] extends (...args: any[]) => any
      ? (...args: Parameters<(Core & Eyes)[TKey]>) => any
      : never
  }
  account?: Partial<AccountInfo>
} = {}): Core & {emitter: EventEmitter} {
  const emitter = new EventEmitter()
  return {
    emitter,
    async getAccountInfo(options) {
      emitter.emit('getAccountInfo', options)
      await hooks?.getAccountInfo?.(options)
      return account as AccountInfo
    },
    async logEvent() {
      emitter.emit('logEvent')
    },
    locate: null as never,
    closeBatch: null as never,
    deleteTest: null as never,
    async locateText(options) {
      emitter.emit('beforeLocateText', options)
      try {
        await utils.general.sleep(10)
        await hooks?.locateText?.(options)
        return Object.fromEntries(options.settings.patterns.map(pattern => [pattern as any, [] as any[]]))
      } finally {
        emitter.emit('afterLocateText', options)
      }
    },
    async extractText(options) {
      emitter.emit('beforeExtractText', options)
      try {
        await utils.general.sleep(10)
        await hooks?.extractText?.(options)
        return [] as string[]
      } finally {
        emitter.emit('afterExtractText', options)
      }
    },
    async openEyes(options) {
      emitter.emit('beforeOpenEyes', options)
      try {
        await utils.general.sleep(10)
        await hooks?.openEyes?.(options)
        const environment = options.settings.environment
        const steps = [] as any[]
        const results = [] as any[]
        let aborted = false
        let closed = false
        return {
          test: {
            testId: 'test-id',
            userTestId: 'user-test-id',
            batchId: 'batch-id',
            baselineId: 'baseline-id',
            sessionId: 'session-id',
            appId: 'app-id',
            resultsUrl: 'https://result-url.com',
            keepBatchOpen: false,
            isNew: true,
            account: account as AccountInfo,
            server: {
              serverUrl: options.settings?.serverUrl,
              apiKey: options.settings?.apiKey,
              proxy: options.settings?.proxy,
            },
          },
          get running() {
            return !closed && !aborted
          },
          get closed() {
            return closed
          },
          get aborted() {
            return aborted
          },
          async getTypedEyes() {
            return this
          },
          async check(options) {
            emitter.emit('beforeCheck', options)
            try {
              await utils.general.sleep(10)
              await hooks?.check?.(options)
              if (options.settings?.name?.startsWith('fail')) {
                throw new Error('Received fail step name')
              }
              const result = {
                asExpected: !options.settings?.name?.startsWith('diff'),
                userTestId: 'user-test-id',
                target: options.target,
                settings: options.settings,
                environment,
              }
              steps.push(result)
              return [result]
            } finally {
              emitter.emit('afterCheck', options)
            }
          },
          async checkAndClose(options) {
            emitter.emit('beforeCheckAndClose', options)
            try {
              await utils.general.sleep(10)
              await hooks?.checkAndClose?.(options)
              const {target, settings} = options
              if (settings?.name?.startsWith('fail')) {
                throw new Error('Received fail step name')
              }
              const result = {asExpected: !settings?.name?.startsWith('diff'), target, settings, environment}
              steps.push(result)
              return [
                {
                  status: steps.every(result => result.asExpected) ? ('Passed' as const) : ('Unresolved' as const),
                  stepsInfo: steps,
                },
              ]
            } finally {
              emitter.emit('afterCheckAndClose', options)
            }
          },
          async close(options) {
            emitter.emit('beforeClose', options)
            try {
              closed = true
              await utils.general.sleep(10)
              await hooks?.close?.(options)
              results.push({
                status: steps.every(result => result.asExpected) ? ('Passed' as const) : ('Unresolved' as const),
                stepsInfo: steps,
              })
            } finally {
              emitter.emit('afterClose', options)
            }
          },
          async abort(options) {
            emitter.emit('beforeAbort', options)
            try {
              aborted = true
              await utils.general.sleep(10)
              await hooks?.abort?.(options)
              results.push({isAborted: true})
            } finally {
              emitter.emit('afterAbort', options)
            }
          },
          async getResults(options) {
            emitter.emit('beforeGetResults', options)
            try {
              await utils.general.sleep(40)
              await hooks?.getResults?.(options)
              return results
            } finally {
              emitter.emit('afterGetResults', options)
            }
          },
        }
      } finally {
        emitter.emit('afterOpenEyes', options)
      }
    },
  }
}
