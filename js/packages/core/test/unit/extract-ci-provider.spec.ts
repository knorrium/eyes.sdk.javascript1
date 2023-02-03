import assert from 'assert'
import {extractCIProvider} from '../../src/utils/extract-ci-provider'

describe('extract-ci-provider', async () => {
  it('identifies github actions by env var', () => {
    process.env.GITHUB_ACTIONS = 'true'
    const provider = extractCIProvider()
    assert.strictEqual(provider, 'GitHub Actions')
  })
})
