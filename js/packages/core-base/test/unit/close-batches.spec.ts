import {makeLogger} from '@applitools/logger'
import {makeCoreRequests} from '../../src/server/requests'
import {makeCloseBatch} from '../../src/close-batch'
import nock from 'nock'
import assert from 'assert'

describe('close-batch', () => {
  const eyesServerUrl = 'http://localhost:1234'
  const apiKey = '12345'
  const requests = makeCoreRequests({agentId: 'core-base/test'})
  const closeBatch = makeCloseBatch({requests, logger: makeLogger()})

  it('throws if delete batch failed', async () => {
    const message = 'something went wrong'

    nock(eyesServerUrl)
      .delete(`/api/sessions/batches/678/close/bypointerId`)
      .query({apiKey})
      .replyWithError({message, code: 500})

    assert.rejects(closeBatch({settings: {batchId: '678', eyesServerUrl, apiKey}}), error => {
      return error.message.includes('something went wrong')
    })
  })

  it("doesn't throw if batchId was not provided", async () => {
    await closeBatch({settings: {batchId: undefined as any, eyesServerUrl, apiKey}})
  })

  it('sends the correct close batch requests to the server', async () => {
    const batchIds = ['123', '456']

    const scopes = batchIds.map(batchId => {
      return nock(eyesServerUrl).delete(`/api/sessions/batches/${batchId}/close/bypointerId`).query({apiKey}).reply(200)
    })

    await closeBatch({settings: batchIds.map(batchId => ({batchId, eyesServerUrl, apiKey}))})

    batchIds.forEach((batchId, index) => {
      assert.strictEqual((scopes[index] as any).basePath, eyesServerUrl)
      assert.strictEqual(
        (scopes[index] as any).interceptors[0].path,
        `/api/sessions/batches/${batchId}/close/bypointerId`,
      )
      assert.deepStrictEqual((scopes[index] as any).interceptors[0].queries, {apiKey})
    })
  })
})
