import * as utils from '@applitools/utils'
import {PropertyData, PropertyDataData} from './PropertyData'

export type BatchInfo = {
  id?: string
  name?: string
  sequenceName?: string
  startedAt?: Date | string
  notifyOnCompletion?: boolean
  properties?: PropertyData[]
}

export class BatchInfoData implements Required<BatchInfo> {
  private _batch: BatchInfo

  constructor()
  constructor(batch?: BatchInfo)
  constructor(name?: string, startedAt?: Date | string, id?: string)
  constructor(batchOrName?: BatchInfo | string, startedAt?: Date | string, id?: string) {
    const batch =
      utils.types.isNull(batchOrName) || utils.types.isString(batchOrName)
        ? {name: batchOrName, id, startedAt}
        : batchOrName
    utils.guard.isString(batch.id, {name: 'id', strict: false})
    utils.guard.isString(batch.name, {name: 'name', strict: false})
    utils.guard.isString(batch.sequenceName, {name: 'sequenceName', strict: false})
    utils.guard.isBoolean(batch.notifyOnCompletion, {name: 'notifyOnCompletion', strict: false})
    utils.guard.isArray(batch.properties, {name: 'properties', strict: false})
    this._batch = {
      id: batch.id ?? utils.general.getEnvValue('BATCH_ID') ?? `generated-${utils.general.guid()}`,
      name: batch.name ?? utils.general.getEnvValue('BATCH_NAME'),
      sequenceName: batch.sequenceName ?? utils.general.getEnvValue('BATCH_SEQUENCE'),
      startedAt: batch.startedAt ?? new Date(),
      notifyOnCompletion: batch.notifyOnCompletion ?? utils.general.getEnvValue('BATCH_NOTIFY', 'boolean') ?? false,
      properties: batch.properties,
    }
  }

  get id(): string {
    return this._batch.id!
  }
  set id(id: string) {
    utils.guard.isString(id, {name: 'id', strict: false})
    this._batch.id = id
  }
  getId(): string {
    return this.id
  }
  setId(id: string): this {
    this.id = id
    return this
  }

  get name(): string {
    return this._batch.name!
  }
  set name(name: string) {
    utils.guard.isString(name, {name: 'name', strict: false})
    this._batch.name = name
  }
  getName(): string {
    return this.name
  }
  setName(name: string): this {
    this.name = name
    return this
  }

  get sequenceName(): string {
    return this._batch.sequenceName!
  }
  set sequenceName(sequenceName: string) {
    utils.guard.isString(sequenceName, {name: 'sequenceName', strict: false})
    this._batch.sequenceName = sequenceName
  }
  getSequenceName(): string {
    return this.sequenceName
  }
  setSequenceName(sequenceName: string): this {
    this.sequenceName = sequenceName
    return this
  }

  get startedAt(): Date | string {
    return this._batch.startedAt!
  }
  set startedAt(startedAt: Date | string) {
    this._batch.startedAt = new Date(startedAt)
  }
  getStartedAt(): Date | string {
    return this.startedAt
  }
  setStartedAt(startedAt: Date | string): this {
    this.startedAt = startedAt
    return this
  }

  get notifyOnCompletion(): boolean {
    return this._batch.notifyOnCompletion!
  }
  set notifyOnCompletion(notifyOnCompletion: boolean) {
    utils.guard.isBoolean(notifyOnCompletion, {name: 'notifyOnCompletion', strict: false})
    this._batch.notifyOnCompletion = notifyOnCompletion
  }
  getNotifyOnCompletion(): boolean {
    return this.notifyOnCompletion
  }
  setNotifyOnCompletion(notifyOnCompletion: boolean): this {
    this.notifyOnCompletion = notifyOnCompletion
    return this
  }

  get properties(): PropertyData[] {
    return this._batch.properties!
  }
  set properties(properties: PropertyData[]) {
    utils.guard.isArray(properties, {name: 'properties', strict: false})
    this._batch.properties = properties
  }
  getProperties(): PropertyDataData[] {
    return this.properties?.map(property => new PropertyDataData(property)) ?? []
  }
  setProperties(properties: PropertyData[]): this {
    this.properties = properties
    return this
  }
  addProperty(name: string, value: string): this
  addProperty(prop: PropertyData): this
  addProperty(propOrName: PropertyData | string, value?: string): this {
    const property = utils.types.isString(propOrName) ? {name: propOrName, value: value!} : propOrName
    if (!this.properties) this.properties = []
    this.properties.push(property)
    return this
  }

  /** @internal */
  toObject(): BatchInfo {
    return this._batch
  }

  /** @internal */
  toJSON(): BatchInfo {
    return utils.general.toJSON(this._batch)
  }

  /** @internal */
  toString() {
    return utils.general.toString(this)
  }
}
