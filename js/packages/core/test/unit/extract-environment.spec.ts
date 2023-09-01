import assert from 'assert'
import {extractEnvironment} from '../../src/utils/extract-environment'

describe('extract environment', async () => {
  it('extends base environment', () => {
    const environment = extractEnvironment({versions: {framework: '1.0.0', lang: '20.13.0'}})
    assert.strictEqual(environment.versions.framework, '1.0.0')
    assert.strictEqual(environment.versions.lang, '20.13.0')
  })

  it('identifies github actions by env var', () => {
    process.env.GITHUB_ACTIONS = 'true'
    const environment = extractEnvironment()
    assert.strictEqual(environment.ci, 'GitHub Actions')
  })
})
