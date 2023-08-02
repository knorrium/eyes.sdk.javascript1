import type * as Core from '@applitools/core'
import {type Logger} from '@applitools/logger'
import {NewTestError} from './errors/NewTestError'
import {DiffsFoundError} from './errors/DiffsFoundError'
import {TestFailedError} from './errors/TestFailedError'
import {RunnerOptions, RunnerOptionsFluent} from './input/RunnerOptions'
import {TestResultsData} from './output/TestResults'
import {TestResultsSummaryData} from './output/TestResultsSummary'
import * as utils from '@applitools/utils'

export abstract class EyesRunner {
  private _core?: Core.Core<Core.SpecType, 'classic' | 'ufg'>
  private _manager?: Core.EyesManager<Core.SpecType, 'classic' | 'ufg'>
  abstract readonly type: 'classic' | 'ufg'
  /** @internal */
  protected readonly _managerSettings: Core.ManagerSettings = {}
  /** @internal */
  protected readonly _getResultsSettings: Core.GetManagerResultsSettings<'classic' | 'ufg'> = {}

  constructor(options?: RunnerOptions) {
    if (options) {
      this._managerSettings = {
        concurrency: options.testConcurrency,
        legacyConcurrency: options.legacyConcurrency,
        fetchConcurrency: options.fetchConcurrency,
      }
      this._getResultsSettings = {removeDuplicateTests: options.removeDuplicateTests}
    }
  }

  /** @internal */
  attach<TSpec extends Core.SpecType = Core.SpecType>(core: Core.Core<TSpec, 'classic' | 'ufg'>) {
    this._core ??= core
  }

  /** @internal */
  async openEyes<TSpec extends Core.SpecType = Core.SpecType>(options: {
    target: TSpec['driver']
    config?: Core.Config<TSpec, 'classic' | 'ufg'>
    logger?: Logger
    on?: (name: string, data?: Record<string, any>) => void
  }): Promise<Core.Eyes<TSpec, 'classic' | 'ufg'>> {
    this._manager ??= await this._core!.makeManager({
      type: this.type,
      settings: this._managerSettings,
      logger: options.logger,
    })
    return await this._manager.openEyes(options)
  }

  async getAllTestResults(throwErr = true): Promise<TestResultsSummaryData> {
    if (!this._manager) return new TestResultsSummaryData()
    try {
      const summary = await this._manager.getResults({settings: {throwErr, ...this._getResultsSettings}})
      return new TestResultsSummaryData({summary, core: this._core})
    } catch (err: any) {
      if (err.info?.result) {
        const result = new TestResultsData({result: err.info.result, core: this._core})
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
  readonly type = 'ufg' as const

  constructor(options?: RunnerOptions)
  /** @deprecated */
  constructor(options?: RunnerOptionsFluent)
  /** @deprecated */
  constructor(legacyConcurrency?: number)
  constructor(optionsOrLegacyConcurrency?: RunnerOptions | RunnerOptionsFluent | number) {
    let options: RunnerOptions | undefined
    if (utils.types.instanceOf(optionsOrLegacyConcurrency, RunnerOptionsFluent)) {
      options = optionsOrLegacyConcurrency.toJSON()
    } else if (utils.types.isNumber(optionsOrLegacyConcurrency)) {
      options = {legacyConcurrency: optionsOrLegacyConcurrency}
    } else {
      options = optionsOrLegacyConcurrency
    }
    super(options)
  }

  get testConcurrency() {
    return this._managerSettings?.concurrency
  }

  /** @deprecated */
  get legacyConcurrency() {
    return this._managerSettings?.legacyConcurrency
  }

  /** @deprecated */
  getConcurrentSessions() {
    return this._managerSettings?.legacyConcurrency
  }
}

export class ClassicRunner extends EyesRunner {
  readonly type = 'classic' as const
}
