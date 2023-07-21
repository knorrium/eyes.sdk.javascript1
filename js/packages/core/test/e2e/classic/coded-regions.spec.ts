import type {Core} from '../../../src/classic/types'
import {type SpecType} from '@applitools/driver'
import {makeCore} from '../../../src/classic/core'
import {getTestInfo} from '@applitools/test-utils'
import * as spec from '@applitools/spec-driver-webdriverio'
import assert from 'assert'

describe('coded regions', () => {
  let driver: spec.Driver,
    destroyDriver: () => Promise<void>,
    core: Core<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>>

  before(async () => {
    ;[driver, destroyDriver] = await spec.build({browser: 'chrome'})
    core = makeCore({spec})
    const page = `data:text/html,
      <div id='outer' style='margin-left: 50px; width:600px; height: 2000px; border: 1px solid;'>
        Outer
        <div id='inner' style='width: 200px; height: 200px; position:relative; margin-top: 500px;'>
          Inner
        </div>
      </div>`
    await driver.url(page)
  })

  after(async () => {
    await destroyDriver?.()
  })

  it('works in full page', async () => {
    const eyes = await core.openEyes({
      target: driver,
      settings: {
        eyesServerUrl: 'https://eyesapi.applitools.com',
        apiKey: process.env.APPLITOOLS_API_KEY!,
        appName: 'core classic',
        testName: 'coded region in full page',
      },
    })
    await eyes.check({
      settings: {
        name: 'layout viewport screenshot',
        fully: true,
        ignoreCaret: true,
        layoutRegions: ['#inner'],
        matchLevel: 'Strict',
      },
    })
    await eyes.close({settings: {updateBaselineIfNew: false}})
    const [result] = await eyes.getResults()
    assert.strictEqual(result.status, 'Passed')
  })

  for (const stitchMode of ['Scroll' as const, 'CSS' as const]) {
    it(`works inside an element with ${stitchMode} stitching`, async () => {
      const eyes = await core.openEyes({
        target: driver,
        settings: {
          eyesServerUrl: 'https://eyesapi.applitools.com',
          apiKey: process.env.APPLITOOLS_API_KEY!,
          appName: 'core classic',
          testName: 'coded region inside an element',
        },
      })
      await eyes.check({
        settings: {
          name: 'layout region screenshot',
          region: '#outer',
          fully: true,
          ignoreCaret: true,
          layoutRegions: ['#inner'],
          matchLevel: 'Strict',
          stitchMode,
        },
      })
      await eyes.close({settings: {updateBaselineIfNew: false}})
      const [result] = await eyes.getResults()
      const testInfo = await getTestInfo(result)
      assert.deepStrictEqual(testInfo.actualAppOutput[0].imageMatchSettings.layout, [
        {
          left: 1,
          top: 519,
          width: 200,
          height: 200,
          regionId: '#inner',
        },
      ])
    })
  }
})
