import type * as Core from '@applitools/core'
import {TestResultContainer, TestResultContainerData} from './TestResultContainer'

export type TestResultsSummary = Iterable<TestResultContainer>

export class TestResultsSummaryData implements Iterable<TestResultContainerData> {
  private _summary?: Core.TestResultSummary<'classic' | 'ufg'>
  private _core?: Core.Core<Core.SpecType, 'classic' | 'ufg'>

  /** @internal */
  constructor(options?: {
    summary?: Core.TestResultSummary<'classic' | 'ufg'>
    core?: Core.Core<Core.SpecType, 'classic' | 'ufg'>
  }) {
    this._summary = options?.summary
    this._core = options?.core
  }

  getAllResults(): TestResultContainerData[] {
    return (
      this._summary?.results.map(container => {
        return new TestResultContainerData({container, core: this._core})
      }) ?? []
    )
  }

  [Symbol.iterator](): Iterator<TestResultContainerData> {
    return (
      this._summary?.results
        .map(container => {
          return new TestResultContainerData({container, core: this._core})
        })
        [Symbol.iterator]() ?? [][Symbol.iterator]()
    )
  }

  /** @internal */
  toJSON(): Core.TestResultContainer<'classic' | 'ufg'>[] {
    return this._summary?.results ?? []
  }

  /** @internal */
  toString() {
    return (
      'result summary {' +
      '\n\tpassed=' +
      this._summary?.passed +
      '\n\tunresolved=' +
      this._summary?.unresolved +
      '\n\tfailed=' +
      this._summary?.failed +
      '\n\texceptions=' +
      this._summary?.exceptions +
      '\n\tmismatches=' +
      this._summary?.mismatches +
      '\n\tmissing=' +
      this._summary?.missing +
      '\n\tmatches=' +
      this._summary?.matches +
      '\n}'
    )
  }
}
