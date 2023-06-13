import {existsSync} from 'node:fs'
import {execSync} from 'node:child_process'
import {restoreCache} from '@actions/cache'
import * as core from '@actions/core'

if (process.platform === 'linux' && existsSync('/etc/alpine-release')) {
  core.debug('alpine system is detected, installing necessary dependencies')
  execSync('apk add --no-cache zstd tar')
}

main()
  .then(results => {
    core.debug(`successfully restored caches ${results}`)
  })
  .catch(err => {
    core.debug(err)
    core.setFailed(err.message)
  })

async function main(): Promise<(string | undefined)[]> {
  const names = core.getMultilineInput('name', {required: true}).flatMap(path => path.split(/[\s\n,]+/))
  return Promise.all(names.map(compositeName => {
    const [name, paths] = compositeName.split('$')
    return restoreCache(paths.split(';'), name, [name.split('/').slice(0, -1).join('/') + '/'], {}, true)
  }))
}
