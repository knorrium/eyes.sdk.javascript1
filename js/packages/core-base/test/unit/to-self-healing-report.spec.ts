import assert from 'assert'
import {toSelfHealingReport} from '../../src/utils/to-self-healing-report'

describe('transform', () => {
  it('driver-session-metadata to self-healing-report', async () => {
    const input = [
      {
        successfulSelector: { using: 'xpath', value: '//blah' },
        message: 'found with saved selector',
        originalSelector: { using: 'css selector', value: '#blah' }
      },
      {
        successfulSelector: { using: 'xpath', value: '//*[@href="/app.html" ]' },
        message: 'found with saved selector',
        originalSelector: { using: 'css selector', value: '#log-in' }
      }
    ]
    toSelfHealingReport(input).operations.forEach((result, index) => {
      assert.deepStrictEqual(result.old.value, input[index].originalSelector.value)
      assert.deepStrictEqual(result.new.value, input[index].successfulSelector.value)
      assert(Date.parse(result.timestamp))
    })
  })
})
