import type * as Core from '@applitools/core'
import assert from 'assert'
import * as utils from '@applitools/utils'

export function makeFakeCore(): Core.Core<any, 'classic' | 'ufg'> & {history: any[]; reset(): void} {
  let history = [] as any[]
  return {
    get history() {
      return history
    },
    base: null as never,
    reset: () => (history = [] as any),
    makeManager,
    locate,
    locateText,
    extractText,
    getViewportSize,
    setViewportSize,
    closeBatch: null as never,
    deleteTest: null as never,
    getECClient: null as never,
    getAccountInfo: null as never,
    logEvent: null as never,
    openEyes: null as never,
  }

  async function makeManager({type, settings}: any): Promise<Core.EyesManager<any, 'classic' | 'ufg'>> {
    history.push({command: 'makeManager', data: {type, settings}})

    return {openEyes, getResults}

    async function openEyes<TType extends 'classic' | 'ufg'>({target, config}: any): Promise<Core.Eyes<any, TType>> {
      const test = {
        config: null as any,
        steps: [] as any[],
        results: [] as any[],
      }

      assert.ok(Boolean(target.isDriver), '"driver" is not a driver')

      test.config = config
      history.push({command: 'openEyes', data: {target, config}})

      return {check, close, abort, getResults} as Core.Eyes<any, TType>

      async function check<TType extends 'classic' | 'ufg'>({settings = {}, config = {}}: any = {}) {
        test.steps.push({settings, config})
        history.push({command: 'check', data: {settings, config}})
        const asExpected = !settings.region || !settings.region.includes('diff')
        return [{asExpected}] as Core.CheckResult<TType>[]
      }

      async function close() {
        history.push({command: 'close'})
        const isDifferent = test.steps.some(step => step.settings.region && step.settings.region.includes('diff'))
        const isNew = test.steps.some(step => step.settings.region && step.settings.region.includes('new'))
        test.results = [
          {
            id: 'test-id',
            name: 'test',
            batchId: 'batch-id',
            batchName: 'batch-name',
            duration: 0,
            startedAt: new Date(),
            appName: 'app',
            status: isDifferent ? 'Unresolved' : 'Passed',
            isNew,
            isDifferent,
            url: 'https://eyes.applitools.com',
          },
        ]
      }

      async function abort() {
        history.push({command: 'abort'})
        return
      }

      async function getResults({settings = {}}: any = {}) {
        history.push({command: 'getEyesResults', data: {settings}})
        test.results.forEach((result: any) => {
          if (settings.throwErr && result.status === 'Unresolved') {
            const error = new Error('error') as any
            error.reason = 'test different'
            error.info = {result}
            throw error
          }
        })

        return test.results
      }
    }

    async function getResults({settings = {}}: any = {}) {
      history.push({command: 'getManagerResults', data: {settings}})
      return {} as any
    }
  }

  async function extractText({regions, config}: any) {
    history.push({command: 'extractText', data: {regions, config}})
    return []
  }

  async function locateText({settings, config}: any) {
    history.push({command: 'locateText', data: {settings, config}})
    return {} as any
  }

  async function locate({settings, config}: any) {
    history.push({command: 'locate', data: {settings, config}})
    return [] as any
  }

  async function getViewportSize({target}: any) {
    assert.ok(target.isDriver, '"driver" is not a driver')
    target.viewportSize ??= {width: 1000, height: 2000}
    history.push({command: 'getViewportSize', data: [target], result: target.viewportSize})
    return target.viewportSize
  }

  async function setViewportSize({target, size}: any) {
    assert.ok(target.isDriver, '"driver" is not a driver')
    assert.ok(
      utils.types.has(size, ['width', 'height']),
      '"size" must be an object with "width" and "height" properties',
    )
    target.viewportSize = size
    history.push({command: 'setViewportSize', data: [target, size]})
  }
}
