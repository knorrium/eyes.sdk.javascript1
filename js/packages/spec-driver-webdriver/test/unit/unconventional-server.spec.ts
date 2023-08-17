import assert from 'assert'
import * as spec from '../../src/spec-driver'

describe('unconventional service provider', async () => {
  it('findElement(non-existent)', async () => {
    const browser = {
      findElement(_using: string, value: string) {
        switch (value) {
          case 'non-existent-1':
            throw new Error('An element could not be located on the page using the given search parameters.')
          case 'non-existent-2':
            throw new Error(`Cannot locate an element using [selector]`)
          case 'non-existent-3':
            throw new Error(`Element with [selector] wasn't found.`)
          case 'error':
            throw new Error('valid error')
        }
      },
    } as any as spec.Driver

    assert.deepStrictEqual(await spec.findElement(browser, {using: 'css selector', value: 'non-existent-1'}), null)
    assert.deepStrictEqual(await spec.findElement(browser, {using: 'css selector', value: 'non-existent-2'}), null)
    assert.deepStrictEqual(await spec.findElement(browser, {using: 'css selector', value: 'non-existent-3'}), null)
    await assert.rejects(spec.findElement(browser, {using: 'css selector', value: 'error'}), Error)
  })

  it('getCapabilities(incompatible-command)', async () => {
    const browser: any = {
      getSession: () => {
        throw new Error('unknown command: Cannot call non W3C standard command while in W3C mode')
      },
      capabilities: {},
    }

    assert.deepStrictEqual(await spec.getCapabilities(browser), {})
  })
})
