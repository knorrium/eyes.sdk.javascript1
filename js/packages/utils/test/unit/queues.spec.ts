import {makeCorkableQueue} from '../../src/queues'
import assert from 'assert'
import * as general from '../../src/general'

describe('queues', () => {
  const options = {
    makeAbortController() {
      const controller = {
        signal: {aborted: false},
        abort: () => (controller.signal.aborted = true),
      }
      return controller
    },
  }

  it('starts task', async () => {
    const queue = makeCorkableQueue(options)

    let isRun = false
    queue.run(async () => (isRun = true))

    assert.strictEqual(isRun, true)
  })

  it(`doesn't start task if corked`, async () => {
    const queue = makeCorkableQueue(options)
    queue.cork()

    let isRun = false
    queue.run(async () => (isRun = true))

    assert.strictEqual(isRun, false)

    queue.uncork()

    assert.strictEqual(isRun, true)
  })

  it('passes abort signal to the task', async () => {
    const queue = makeCorkableQueue(options)

    let isRun1 = false
    let isRun2 = false
    queue.run(async signal => {
      await general.sleep(100)
      if (!signal.aborted) isRun1 = true
    })
    queue.run(async signal => {
      await general.sleep(100)
      if (!signal.aborted) isRun2 = true
    })

    queue.cork()

    await general.sleep(200)

    assert.strictEqual(isRun1, true)
    assert.strictEqual(isRun2, false)

    queue.uncork()

    await general.sleep(200)

    assert.strictEqual(isRun1, true)
    assert.strictEqual(isRun2, true)
  })
})
