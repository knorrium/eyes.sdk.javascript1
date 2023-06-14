import {setTimeout} from 'timers/promises'
import {exec, getExecOutput} from '@actions/exec'
import * as core from '@actions/core'

export async function makeTask(options: {name: string, branch?: string, maxParallel?: number}) {
  options.branch ||= 'internal/action-queue'
  options.maxParallel = Math.max(1, options.maxParallel || 1)

  await exec(`git checkout -B ${options.branch}`)
  await exec(`git push --set-upstream origin ${options.branch}`)
  await exec(`git fetch`)

  let anchor: string | undefined

  return {start, stop, wait}

  async function start() {
    const {stdout} = await getExecOutput(`git commit -m "queue: ${options.name} start" --allow-empty --no-verify`)
    await exec(`git push`)
    // format "[<branch-name> <hash>] queue: <queue> start"
    const match = stdout.trim().match(/^\[[\w\-\/]+ (?<hash>\w{9})\] .+$/)
    anchor = match!.groups!.hash
  }

  async function stop() {
    await exec(`git commit -m "queue: ${options.name} stop" --allow-empty --no-verify`)
    await exec(`git push`)
  }

  async function wait() {
    const {stdout} = await getExecOutput(`git log ${anchor}.. --reverse --format="tformat:%s" --grep="^queue: ${options.name}" --since="3 hours ago"`)
    let count = stdout.trim().split('\n').reduce((count, log) => {
      if (log.includes('start')) return count + 1
      if (log.includes('stop') && count > 0) return count - 1
      return count
    }, 0)

    while (count >= options.maxParallel!) {
      await setTimeout(10_000)
      const {stdout} = await getExecOutput(`git log ${anchor}.. --reverse --format="tformat:%h" --grep="^queue: ${options.name} stop"`)
      if (stdout) {
        const hashes = stdout.trim().split('\n')
        count -= hashes.length
        anchor = hashes.at(-1)!
      }
    }
  }
}