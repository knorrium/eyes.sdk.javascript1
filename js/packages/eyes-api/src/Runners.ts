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
  abstract readonly type: 'classic' | 'ufg'
  /** @internal */
  protected readonly _managerSettings?: Core.ManagerSettings
  /** @internal */
  protected readonly _getResultsSettings?: Core.GetManagerResultsSettings<'classic' | 'ufg'>

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
    this._manager ??= await this._core!.makeManager({type: this.type, settings: this._managerSettings})
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
      const summary = await this._manager.getResults({settings: {throwErr, ...this._getResultsSettings}})
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
  /** @internal */
  readonly type = 'ufg' as const
  /** @internal */
  /** @internal */
  protected readonly _managerSettings?: Core.ManagerSettings
  /** @internal */
  protected readonly _getResultsSettings?: Core.GetManagerResultsSettings<'ufg'>

  constructor(options?: RunnerOptions)
  /** @deprecated */
  constructor(options?: RunnerOptionsFluent)
  /** @deprecated */
  constructor(legacyConcurrency?: number)
  constructor(optionsOrLegacyConcurrency?: RunnerOptions | RunnerOptionsFluent | number) {
    super()
    if (utils.types.isNumber(optionsOrLegacyConcurrency)) {
      this._managerSettings = {legacyConcurrency: optionsOrLegacyConcurrency}
    } else if (optionsOrLegacyConcurrency) {
      const options =
        optionsOrLegacyConcurrency instanceof RunnerOptionsFluent
          ? optionsOrLegacyConcurrency.toJSON()
          : optionsOrLegacyConcurrency
      this._managerSettings = {concurrency: options.testConcurrency}
      this._getResultsSettings = {removeDuplicateTests: options.removeDuplicateTests}
    }
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
  /** @internal */
  readonly type = 'classic' as const
  /** @internal */
  protected readonly _getResultsSettings?: Core.GetManagerResultsSettings<'classic'>

  constructor(options?: RunnerOptions) {
    super()
    if (options) {
      this._getResultsSettings = {removeDuplicateTests: options.removeDuplicateTests}
    }
  }
}
