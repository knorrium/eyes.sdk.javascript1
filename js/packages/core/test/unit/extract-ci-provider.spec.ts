import assert from 'assert'
import {extractCIProvider} from '../../src/utils/extract-ci-provider'

describe('should indentify CI provider by env var', async () => {
  it('extractCIProvider', () => {
    process.env.GITHUB_ACTIONS = 'true'
    const provider = extractCIProvider()
    assert.strictEqual(provider, 'GitHub Actions')
  })
})
