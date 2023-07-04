import {makeCore} from '../../../src/ufg/core'
import {makeFakeClient} from '../../utils/fake-ufg-client'
import {makeFakeCore} from '../../utils/fake-base-core'
import assert from 'assert'

describe('open-eyes', () => {
  it('throws an error if an error was thrown during requesting account info', async () => {
    const fakeClient = makeFakeClient()
    const fakeCore = makeFakeCore({
      hooks: {
        getAccountInfo: () => {
          throw new Error('get account info failed')
        },
      },
    })
    const core = makeCore({concurrency: 5, base: fakeCore, clients: {ufg: fakeClient}})

    await assert.rejects(
      core.openEyes({
        settings: {serverUrl: 'server-url', apiKey: 'api-key', appName: 'app-name', testName: 'test-name'},
      }),
      error => error.message === 'get account info failed',
    )
  })

  it('should populate test information', async () => {
    const fakeClient = makeFakeClient()
    const accountInfo = {
      ufgServer: {
        serverUrl: 'server-url',
        uploadUrl: 'uploadUrl',
        stitchingServiceUrl: 'stitchingService',
        accessToken: 'token',
        useDnsCache: true,
      },
      server: {serverUrl: 'server-url', apiKey: 'api-key', proxy: {url: 'proxy-url'}},
      rcaEnable: true,
      stitchingServiceUrl: 'stitchingService',
      uploadUrl: 'uploadUrl',
      maxImageHeight: 1000,
      maxImageArea: 1000,
    }
    const fakeCore = makeFakeCore({
      account: accountInfo,
    })

    const core = makeCore({concurrency: 5, base: fakeCore, clients: {ufg: fakeClient}})
    const openResult = await core.openEyes({
      settings: {
        serverUrl: 'server-url',
        apiKey: 'api-key',
        appName: 'app-name',
        testName: 'test-name',
        proxy: {
          url: 'proxy-url',
        },
        keepBatchOpen: true,
        batch: {
          id: 'batchId',
        },
        userTestId: 'testId',
        useDnsCache: true,
      },
    })
    const expected = {
      userTestId: 'testId',
      batchId: 'batchId',
      keepBatchOpen: true,
      server: accountInfo.server,
      ufgServer: accountInfo.ufgServer,
      account: accountInfo,
    }
    assert.deepStrictEqual(openResult.test, expected)
  })
})
