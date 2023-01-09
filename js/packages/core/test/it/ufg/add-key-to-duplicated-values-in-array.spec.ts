import addKeyToDuplicatedValuesInArray from '../../../src/ufg/utils/add-key-to-duplicated-values-in-array'
import assert from 'assert'
import {type Renderer} from '@applitools/ufg-client'

describe('add-key-to-duplicated-values-in-array', () => {
  const genericTests: {input: Renderer[]; output: Renderer[]}[] = [
    {
      input: [
        {name: 'firefox', width: 100, height: 100},
        {name: 'chrome', width: 100, height: 100},
      ],
      output: [
        {name: 'firefox', width: 100, height: 100},
        {name: 'chrome', width: 100, height: 100},
      ],
    },
    {
      input: [
        {name: 'firefox', width: 100, height: 100},
        {name: 'firefox', width: 100, height: 100},
      ],
      output: [
        {name: 'firefox', width: 100, height: 100},
        {name: 'firefox', width: 100, height: 100, id: '1'},
      ],
    },
    {
      input: [
        {name: 'firefox', width: 100, height: 100},
        {name: 'firefox', width: 100, height: 100, id: 'bla'},
      ],
      output: [
        {name: 'firefox', width: 100, height: 100},
        {name: 'firefox', width: 100, height: 100, id: 'bla'},
      ],
    },
    {
      input: [
        {name: 'firefox', width: 100, height: 100},
        {name: 'firefox', width: 100, height: 100},
        {name: 'firefox', width: 100, height: 100, id: ''},
      ],
      output: [
        {name: 'firefox', width: 100, height: 100},
        {name: 'firefox', width: 100, height: 100, id: '1'},
        {name: 'firefox', width: 100, height: 100, id: ''},
      ],
    },
    {
      input: [
        {name: 'firefox', width: 100, height: 100, id: 'bla'},
        {name: 'firefox', width: 100, height: 100, id: 'bla'},
      ],
      output: [
        {name: 'firefox', width: 100, height: 100, id: 'bla'},
        {name: 'firefox', width: 100, height: 100, id: 'bla-1'},
      ],
    },
  ]
  for (let i = 0; i < genericTests.length; i++) {
    it(`remove duplicated renderers generic test ${i}`, async function () {
      const {input, output} = genericTests[i]
      const results = addKeyToDuplicatedValuesInArray(input)
      assert.deepStrictEqual(results, output)
    })
  }
})
