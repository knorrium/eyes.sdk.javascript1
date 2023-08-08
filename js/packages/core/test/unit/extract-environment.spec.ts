import assert from 'assert'
import {extractEnvironment} from '../../src/utils/extract-environment'

describe('extract environment', async () => {
  it('identifies github actions by env var', () => {
    process.env.GITHUB_ACTIONS = 'true'
    const environment = extractEnvironment()
    assert.deepStrictEqual(environment.ci, 'GitHub Actions')
  })
})
