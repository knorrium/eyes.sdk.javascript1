import type {Core} from '../../../src/classic/types'
import {type SpecType} from '@applitools/driver'
import {makeCore} from '../../../src/classic/core'
import * as spec from '@applitools/spec-driver-webdriver'
import assert from 'assert'

describe('check eyes classic', () => {
  const name = 'switch to iframe inside shadow dom'
  let driver: spec.Driver,
    destroyDriver: () => Promise<void>,
    core: Core<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    core = makeCore({spec})
    await driver.navigateTo('https://applitools.github.io/demo/TestPages/ShadowDOM/iframe-in-iframe.html')
  })

  after(async () => {
    await destroyDriver?.()
  })
  it(name, async () => {
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core classic',
        testName: name,
      },
    })

    const container = await driver.findElement('css selector', '#has-shadow-root')
    const frame = await driver.executeScript(`return arguments[0].shadowRoot.querySelector("iframe")`, [container])
    await driver.switchToFrame(frame)
    const innerContainer = await driver.findElement('css selector', '#has-shadow-root')
    const innerFrame = await driver.executeScript(`return arguments[0].shadowRoot.querySelector("iframe")`, [
      innerContainer,
    ])
    await driver.switchToFrame(innerFrame)
    assert.strictEqual(await driver.executeScript('return document.title', []), 'Simple HTML')

    await eyes.check({
      settings: {
        name,
        fully: true,
        ignoreCaret: true,
        matchLevel: 'Strict',
      },
    })
    await eyes.close()
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })
})
