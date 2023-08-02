import {strict as assert} from 'assert'
import * as api from '../../src'
import * as utils from '@applitools/utils'

describe('CheckSettings', () => {
  const spec = {
    isElement(element: any) {
      return Boolean(element.isElement)
    },
    isSelector(selector: any) {
      return utils.types.isString(selector) || utils.types.has(selector, 'fakeSelector')
    },
  } as any

  class CheckSettings extends api.CheckSettingsAutomation {
    protected static _spec = spec
  }

  const Target = {...api.Target, spec}

  it('sets shadow selector with string', () => {
    const checkSettings = Target.shadow('el-with-shadow').region('el')
    assert.deepStrictEqual(checkSettings.toJSON().settings, {region: {selector: 'el-with-shadow', shadow: 'el'}})
  })

  it('sets shadow selector with framework selector', () => {
    const checkSettings = Target.shadow({fakeSelector: 'el-with-shadow'}).region({fakeSelector: 'el'})
    assert.deepStrictEqual(checkSettings.toJSON().settings, {
      region: {
        selector: {fakeSelector: 'el-with-shadow'},
        shadow: {fakeSelector: 'el'},
      },
    })
  })

  it('set waitBeforeCapture', () => {
    const checkSettings = new CheckSettings().waitBeforeCapture(1000)
    assert.equal(checkSettings.toJSON().settings.waitBeforeCapture, 1000)
  })

  describe('lazyLoad', () => {
    it('set lazyLoad with options object', () => {
      const expected = {
        scrollLength: 1,
        waitingTime: 2,
        maxAmountToScroll: 3,
      }
      const checkSettings = new CheckSettings().lazyLoad(expected)
      const actual = checkSettings.toJSON().settings.lazyLoad
      assert.deepStrictEqual(actual, expected)
    })
    it('set lazyLoad with no value', () => {
      const expected = true
      const checkSettings = new CheckSettings().lazyLoad()
      const actual = checkSettings.toJSON().settings.lazyLoad
      assert.deepStrictEqual(actual, expected)
    })
  })

  it('set webview', () => {
    const checkSettings = new CheckSettings().webview(true)
    assert.equal(checkSettings.toJSON().settings.webview, true)
    checkSettings.webview('blah')
    assert.equal(checkSettings.toJSON().settings.webview, 'blah')
  })

  it('set webview static', () => {
    const id = 'blah-blah'
    const settings = Target.webview(id)
    assert.equal(settings.toJSON().settings.webview, id)
  })

  it('set densityMetrics', () => {
    const expected = {scaleRatio: 10, xdpi: 10, ydpi: 10}
    const checkSettings = new CheckSettings().densityMetrics(expected)
    const actual = checkSettings.toJSON().settings.densityMetrics
    assert.deepStrictEqual(actual, expected)
  })

  describe('layoutBreakpoints', () => {
    it('with boolean', () => {
      const checkSettings = Target.window().layoutBreakpoints(true, {reload: true})
      assert.deepStrictEqual(checkSettings.toJSON().settings, {layoutBreakpoints: {breakpoints: true, reload: true}})
    })
    it('with array of numbers', () => {
      const checkSettings = Target.window().layoutBreakpoints([1, 2, 3], {reload: true})
      assert.deepStrictEqual(checkSettings.toJSON().settings, {
        layoutBreakpoints: {
          breakpoints: [3, 2, 1],
          reload: true,
        },
      })
    })
  })
})
