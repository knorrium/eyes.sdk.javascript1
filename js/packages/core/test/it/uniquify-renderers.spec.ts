import {uniquifyRenderers} from '../../src/automation/utils/uniquify-renderers'
import assert from 'assert'

describe('uniquify-renderers', () => {
  it(`adds unique id to duplicated renderers without id`, () => {
    const results = uniquifyRenderers([
      {name: 'firefox', width: 100, height: 100, id: '1'},
      {name: 'firefox', width: 100, height: 100},
      {name: 'firefox', width: 100, height: 100},
      {name: 'firefox', width: 100, height: 100, id: '2'},
    ])
    assert.deepStrictEqual(results, [
      {name: 'firefox', width: 100, height: 100, id: '1'},
      {name: 'firefox', width: 100, height: 100},
      {name: 'firefox', width: 100, height: 100, id: '3'},
      {name: 'firefox', width: 100, height: 100, id: '2'},
    ])
  })

  it(`removes duplicated renderers with id`, () => {
    const results = uniquifyRenderers([
      {name: 'firefox', width: 100, height: 100, id: 'bla'},
      {name: 'firefox', width: 100, height: 100, id: 'bla'},
    ])
    assert.deepStrictEqual(results, [{name: 'firefox', width: 100, height: 100, id: 'bla'}])
  })

  it(`doesn't changes renderers if there are no duplications`, () => {
    const results = uniquifyRenderers([
      {name: 'firefox', width: 100, height: 100},
      {name: 'chrome', width: 100, height: 100},
    ])
    assert.deepStrictEqual(results, [
      {name: 'firefox', width: 100, height: 100},
      {name: 'chrome', width: 100, height: 100},
    ])
  })

  it(`doesn't changes renderers if all of the duplications already have unique id`, () => {
    const results = uniquifyRenderers([
      {name: 'firefox', width: 100, height: 100},
      {name: 'firefox', width: 100, height: 100},
    ])
    assert.deepStrictEqual(results, [
      {name: 'firefox', width: 100, height: 100},
      {name: 'firefox', width: 100, height: 100, id: '1'},
    ])
  })
})
