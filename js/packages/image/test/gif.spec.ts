import {promises as fs} from 'fs'
import {freezeGif} from '../src/formats/gif'
import assert from 'assert'

describe('gif', () => {
  it('should freeze animated gif', async () => {
    const actual = await freezeGif(new Uint8Array(await fs.readFile('./test/fixtures/house.gif')))
    const expected = await fs.readFile('./test/fixtures/house.frozen.gif')
    assert.ok(Buffer.compare(new Uint8Array(actual), expected) === 0)
  })
})
