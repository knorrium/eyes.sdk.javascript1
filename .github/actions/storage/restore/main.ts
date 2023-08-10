import {existsSync} from 'node:fs'
import {execSync} from 'node:child_process'
import {setTimeout} from 'node:timers/promises'
import {restoreCache} from '@actions/cache'
import * as core from '@actions/core'

if (process.platform === 'linux') {
  if (existsSync('/etc/alpine-release')) {
    core.debug('alpine system is detected, installing necessary dependencies')
    execSync('apk add --no-cache zstd tar')
  } else if (execSync('cat /etc/*release | grep ^ID=', {encoding: 'utf-8'}).includes('debian')) {
    core.debug('debian system is detected, installing necessary dependencies')
    execSync('apt-get update && apt-get install -y zstd')
  }
}

main()
  .then(results => {
    core.info(`successfully restored caches ${results}`)
  })
  .catch(err => {
    console.error(err)
    core.setFailed(err.message)
  })

async function main(): Promise<string[]> {
  const names = core.getMultilineInput('name', {required: true}).flatMap(name => name ? name.split(/[\s\n,]+/) : [])
  const latest = core.getBooleanInput('latest')
  const wait = core.getBooleanInput('wait')

  return Promise.all(names.map(compositeName => {
    const [name, paths] = compositeName.split('$')
    const fallbacks = latest ? [name.replace(/(?<=#).+$/, '')] : []
    return restore({paths: paths.split(';'), name, fallbacks, wait: wait ? 600_000 : 0})
  }))

  async function restore(options: {
    paths: string[],
    name: string,
    fallbacks: string[],
    wait?: number,
    startedAt?: number
  }): Promise<string> {
    options.startedAt ??= Date.now()
    const restoredName = await restoreCache([...options.paths], options.name, options.fallbacks, {}, true)
    if (restoredName) {
      core.info(`cache was successfully restored with ${options.name}`)
      return restoredName
    } else if (options.wait) {
      if (options.startedAt + options.wait <= Date.now()) {
        throw new Error(`Failed to restore artifact ${options.name} (with fallbacks ${options.fallbacks?.join(', ') || '-'}) during ${options.wait} ms`)
      }
      core.info(`waiting for cache with name ${options.name} to appear`)
      await setTimeout(20_000)
      return restore(options)
    } else {
      throw new Error(`Failed to restore artifact ${options.name} (with fallbacks ${options.fallbacks?.join(', ') || '-'})`)
    }
  }
}
