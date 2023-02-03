import * as utils from '@applitools/utils'
import {Location} from './Location'
import {RectangleSize} from './RectangleSize'

/** @deprecated */
export type LegacyRegion = {left: number; top: number; width: number; height: number}

export type Region = Location & RectangleSize

export class RegionData implements Required<Region> {
  private _region: Region

  constructor(region: Region)
  constructor(location: Location, size: RectangleSize)
  constructor(x: number, y: number, width: number, height: number)
  constructor(
    regionOrLocationOrX: Region | Location | number,
    sizeOrY?: RectangleSize | number,
    width?: number,
    height?: number,
  ) {
    let region: Region
    if (utils.types.isNumber(regionOrLocationOrX)) {
      region = {x: regionOrLocationOrX, y: sizeOrY as number, width: width!, height: height!}
    } else if (!utils.types.has(regionOrLocationOrX, ['width', 'height'])) {
      region = {...regionOrLocationOrX, ...(sizeOrY as RectangleSize)}
    } else {
      region = regionOrLocationOrX
    }
    utils.guard.isNumber(region.x, {name: 'x'})
    utils.guard.isNumber(region.y, {name: 'y'})
    utils.guard.isNumber(region.width, {name: 'width', gte: 0})
    utils.guard.isNumber(region.height, {name: 'height', gte: 0})
    this._region = region
  }

  get x(): number {
    return this._region.x
  }
  set x(x: number) {
    utils.guard.isNumber(x, {name: 'x'})
    this._region.x = x
  }
  get left(): number {
    return this.x
  }
  set left(left: number) {
    this.x = left
  }
  getX(): number {
    return this.x
  }
  setX(x: number) {
    this.x = x
  }
  getLeft(): number {
    return this.x
  }
  setLeft(left: number) {
    this.x = left
  }

  get y(): number {
    return this._region.y
  }
  set y(y: number) {
    utils.guard.isNumber(y, {name: 'y'})
    this._region.y = y
  }
  get top(): number {
    return this.y
  }
  set top(top: number) {
    this.y = top
  }
  getY(): number {
    return this.y
  }
  setY(y: number) {
    this.y = y
  }
  getTop(): number {
    return this.y
  }
  setTop(top: number) {
    this.y = top
  }

  get width(): number {
    return this._region.width
  }
  set width(width: number) {
    utils.guard.isNumber(width, {name: 'width', gte: 0})
    this._region.width = width
  }
  getWidth(): number {
    return this._region.width
  }
  setWidth(width: number) {
    this.width = width
  }

  get height(): number {
    return this._region.height
  }
  set height(height: number) {
    utils.guard.isNumber(height, {name: 'height', gte: 0})
    this._region.height = height
  }
  getHeight(): number {
    return this._region.height
  }
  setHeight(height: number) {
    this.height = height
  }

  /** @internal */
  toObject(): Region {
    return this._region
  }

  /** @internal */
  toJSON(): Region {
    return utils.general.toJSON(this._region)
  }

  /** @internal */
  toString() {
    return `(${this.x}, ${this.y}) ${this.width}x${this.height}`
  }
}
