import assert from 'assert'
import fs from 'fs'
import {freezeGif} from '../src/formats/gif'

describe('gif', () => {
  it('should freeze animated gif', async () => {
    const actual = await freezeGif(fs.readFileSync('./test/fixtures/house.gif'))
    const expected = fs.readFileSync('./test/fixtures/house.frozen.gif')
    assert.ok(Buffer.compare(actual, expected) === 0)
  })
})
