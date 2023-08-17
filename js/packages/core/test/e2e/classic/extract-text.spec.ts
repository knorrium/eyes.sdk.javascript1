import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('extract-text', () => {
  let driver: spec.Driver, destroyDriver: () => Promise<void>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('works', async () => {
    const core = makeCore({spec})
    const serverSettings = {
      eyesServerUrl: 'https://eyesapi.applitools.com',
      apiKey: process.env.APPLITOOLS_API_KEY!,
    }
    await core.setViewportSize!({target: driver, size: {width: 700, height: 460}})
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/OCRPage')
    const strings = await core.extractText({
      target: driver,
      settings: [
        {...serverSettings, region: 'body > h1'},
        {...serverSettings, region: {type: 'css', selector: 'body > h1'}},
        {...serverSettings, region: {type: 'css selector', selector: 'body > h1'}},
      ],
    })
    assert.deepStrictEqual(strings, ['Header 1: Hello world!', 'Header 1: Hello world!', 'Header 1: Hello world!'])
  })
})
