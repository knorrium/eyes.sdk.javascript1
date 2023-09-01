import type {Eyes, CheckSettings} from '../../src/types'
import {makeLogger} from '@applitools/logger'
import {makeFakeCore} from '../utils/fake-base-core'
import {makeCheck} from '../../src/check'
import assert from 'assert'

describe('check', () => {
  it('should calculate default value for sendDom using other settings', async () => {
    const fakeCore = makeFakeCore({
      hooks: {
        check({settings}) {
          assert.strictEqual((settings as CheckSettings<any, 'ufg' | 'classic'>).sendDom, true)
        },
      },
    })
    const fakeEyes = (await fakeCore.openEyes({
      settings: {eyesServerUrl: '', apiKey: '', appName: '', testName: ''},
    })) as Eyes<any>

    const check = makeCheck({eyes: fakeEyes, logger: makeLogger()})

    await check({settings: {enablePatterns: true}})
    await check({settings: {useDom: true}})
    await check({settings: {matchLevel: 'Layout'}})
    await assert.rejects(check())
    await assert.rejects(check({settings: {sendDom: false}}))
  })

  it('should set true as a default value for sendDom if rca is enabled', async () => {
    const fakeCore = makeFakeCore({
      hooks: {
        check({settings}) {
          assert.strictEqual((settings as CheckSettings<any, 'ufg' | 'classic'>).sendDom, true)
        },
      },
      account: {rcaEnabled: true},
    })
    const fakeEyes = (await fakeCore.openEyes({
      settings: {eyesServerUrl: '', apiKey: '', appName: '', testName: ''},
    })) as Eyes<any>

    const check = makeCheck({
      eyes: fakeEyes as Eyes<any, 'classic'>,
      logger: makeLogger(),
    })

    await check()
    await check({settings: {enablePatterns: false}})
    await check({settings: {useDom: false}})
    await check({settings: {matchLevel: 'Strict'}})
    await assert.rejects(check({settings: {sendDom: false}}))
  })

  it('should merge default overlap with provided overlap', async () => {
    const defaultOverlap = {top: 10, bottom: 50}
    const overlaps = [undefined, {}, {bottom: 0}, {bottom: 0, top: 0}]

    const fakeCore = makeFakeCore({
      hooks: {
        check: ({settings}: any) => {
          assert.deepStrictEqual(settings!.overlap, {...defaultOverlap, ...overlaps[settings!.stepIndex]})
        },
      },
    })
    const fakeEyes = await fakeCore.openEyes({settings: {eyesServerUrl: '', apiKey: '', appName: '', testName: ''}})
    const check = makeCheck({
      eyes: fakeEyes as Eyes<any, 'classic'>,
      logger: makeLogger(),
    })
    for (const [stepIndex, overlap] of overlaps.entries()) {
      await check({settings: {stepIndex, overlap}})
    }
  })
})
