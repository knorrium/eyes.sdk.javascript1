import type * as Core from '@applitools/core'
import {type Logger} from '@applitools/logger'
import {NewTestError} from './errors/NewTestError'
import {DiffsFoundError} from './errors/DiffsFoundError'
import {TestFailedError} from './errors/TestFailedError'
import {RunnerOptions, RunnerOptionsFluent} from './input/RunnerOptions'
import {TestResultsData} from './output/TestResults'
import {TestResultsSummaryData} from './output/TestResultsSummary'
import {Eyes} from './Eyes'
import * as utils from '@applitools/utils'

export abstract class EyesRunner {
  private _core?: Core.Core<Core.SpecType, 'classic' | 'ufg'>
  private _manager?: Core.EyesManager<Core.SpecType, 'classic' | 'ufg'>
  private _eyes: Eyes<Core.SpecType>[] = []

  /** @internal */
  abstract get config(): {type: 'classic' | 'ufg'}

  /** @internal */
  attach<TSpec extends Core.SpecType = Core.SpecType>(eyes: Eyes<TSpec>, core: Core.Core<TSpec, 'classic' | 'ufg'>) {
    this._core ??= core
    this._eyes.push(eyes)
  }

  /** @internal */
  async openEyes<TSpec extends Core.SpecType = Core.SpecType>(options: {
    target: TSpec['driver']
    config?: Core.Config<TSpec, 'classic' | 'ufg'>
    logger?: Logger
    on?: (name: string, data?: Record<string, any>) => void
  }): Promise<Core.Eyes<TSpec, 'classic' | 'ufg'>> {
    this._manager ??= await this._core!.makeManager(this.config)
    return await this._manager.openEyes(options)
  }

  async getAllTestResults(throwErr = true): Promise<TestResultsSummaryData> {
    if (!this._manager) return new TestResultsSummaryData()
    const [eyes] = this._eyes
    const deleteTest = (options: any) =>
      this._core!.deleteTest({
        ...options,
        settings: {
          ...options.settings,
          serverUrl: eyes.configuration.serverUrl!,
          apiKey: eyes.configuration.apiKey!,
          proxy: eyes.configuration.proxy,
        },
      })
    try {
      const summary = await this._manager.getResults({settings: {throwErr}})
      return new TestResultsSummaryData({summary, deleteTest})
    } catch (err: any) {
      if (err.info?.result) {
        const result = new TestResultsData({result: err.info.result, deleteTest})
        if (err.reason === 'test failed') {
          throw new TestFailedError(err.message, result)
        } else if (err.reason === 'test different') {
          throw new DiffsFoundError(err.message, result)
        } else if (err.reason === 'test new') {
          throw new NewTestError(err.message, result)
        }
      }
      throw err
    }
  }
}

export class VisualGridRunner extends EyesRunner {
  private _testConcurrency?: number
  private _legacyConcurrency?: number

  constructor(options?: RunnerOptions)
  /** @deprecated */
  constructor(options?: RunnerOptionsFluent)
  /** @deprecated */
  constructor(legacyConcurrency?: number)
  constructor(optionsOrLegacyConcurrency?: RunnerOptions | RunnerOptionsFluent | number) {
    super()
    if (utils.types.isNumber(optionsOrLegacyConcurrency)) {
      this._legacyConcurrency = optionsOrLegacyConcurrency
    } else if (optionsOrLegacyConcurrency) {
      const options =
        optionsOrLegacyConcurrency instanceof RunnerOptionsFluent
          ? optionsOrLegacyConcurrency.toJSON()
          : optionsOrLegacyConcurrency
      this._testConcurrency = options.testConcurrency
    }
  }

  /** @internal */
  get config() {
    return {
      type: 'ufg' as const,
      concurrency: this._testConcurrency,
      legacyConcurrency: this._legacyConcurrency,
    }
  }

  get testConcurrency() {
    return this._testConcurrency
  }

  /** @deprecated */
  get legacyConcurrency() {
    return this._legacyConcurrency
  }

  /** @deprecated */
  getConcurrentSessions() {
    return this._legacyConcurrency
  }
}

export class ClassicRunner extends EyesRunner {
  /** @internal */
  get config() {
    return {type: 'classic' as const}
  }
}
