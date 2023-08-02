import type * as Core from '@applitools/core'
import {initSDK, type SDK} from './SDK'
import * as utils from '@applitools/utils'
import {ProxySettings} from './input/ProxySettings'

type BatchCloseOptions = {
  batchIds: string[]
  serverUrl: string
  apiKey: string
  proxy?: ProxySettings
}

export function closeBatch(sdk: SDK): (options: BatchCloseOptions) => Promise<void> {
  return function closeBatch(settings: BatchCloseOptions) {
    utils.guard.notNull(settings.batchIds, {name: 'options.batchIds'})
    const {core} = initSDK(sdk)
    return core.closeBatch({
      settings: settings.batchIds.map(batchId => ({batchId, eyesServerUrl: settings.serverUrl, ...settings})),
    })
  }
}

export class BatchClose {
  protected static readonly _sdk: SDK
  protected get _sdk(): SDK {
    return (this.constructor as typeof BatchClose)._sdk
  }

  private _core: Core.Core<Core.SpecType, 'classic' | 'ufg'>
  private _settings = {} as BatchCloseOptions

  static async close(settings: BatchCloseOptions): Promise<void> {
    utils.guard.notNull(settings.batchIds, {name: 'options.batchIds'})
    const {core} = initSDK(this._sdk)
    await core.closeBatch({
      settings: settings.batchIds.map(batchId => ({batchId, eyesServerUrl: settings.serverUrl, ...settings})),
    })
  }

  constructor(options?: BatchCloseOptions) {
    const {core} = initSDK(this._sdk)
    this._core = core
    if (options) this._settings = options
  }

  async close(): Promise<void> {
    utils.guard.notNull(this._settings.batchIds, {name: 'batchIds'})
    await this._core.closeBatch({
      settings: this._settings.batchIds.map(batchId => ({
        batchId,
        eyesServerUrl: this._settings.serverUrl,
        ...this._settings,
      })),
    })
  }

  setBatchIds(batchIds: string[]): this {
    this._settings.batchIds = batchIds
    return this
  }

  setUrl(serverUrl: string): this {
    this._settings.serverUrl = serverUrl
    return this
  }

  setApiKey(apiKey: string): this {
    this._settings.apiKey = apiKey
    return this
  }

  setProxy(proxy: ProxySettings): this {
    this._settings.proxy = proxy
    return this
  }
}
