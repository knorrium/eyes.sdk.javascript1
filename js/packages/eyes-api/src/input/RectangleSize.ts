import * as utils from '@applitools/utils'

export type RectangleSize = {
  width: number
  height: number
}

export class RectangleSizeData implements Required<RectangleSize> {
  private _size: RectangleSize

  constructor(size: RectangleSize)
  constructor(width: number, height: number)
  constructor(sizeOrWidth: RectangleSize | number, height?: number) {
    const size = utils.types.isNumber(sizeOrWidth) ? {width: sizeOrWidth, height: height!} : sizeOrWidth
    utils.guard.isNumber(size.width, {name: 'width', gte: 0})
    utils.guard.isNumber(size.height, {name: 'height', gte: 0})
    this._size = size
  }

  get width(): number {
    return this._size.width
  }
  set width(width: number) {
    utils.guard.isNumber(width, {name: 'width', gte: 0})
    this._size.width = width
  }
  getWidth(): number {
    return this.width
  }
  setWidth(width: number) {
    this.width = width
  }

  get height(): number {
    return this._size.height
  }
  set height(height: number) {
    utils.guard.isNumber(height, {name: 'height', gte: 0})
    this._size.height = height
  }
  getHeight(): number {
    return this.height
  }
  setHeight(height: number) {
    this.height = height
  }

  /** @internal */
  toObject(): RectangleSize {
    return this._size
  }

  /** @internal */
  toJSON(): RectangleSize {
    return utils.general.toJSON(this._size)
  }

  /** @internal */
  toString() {
    return `${this.width}x${this.height}`
  }
}
