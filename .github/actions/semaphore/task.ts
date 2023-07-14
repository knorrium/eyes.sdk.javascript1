import {setTimeout} from 'timers/promises'
import {randomUUID} from 'crypto'
import {exec, getExecOutput} from '@actions/exec'

export function makeTask(options: {id?: string, name: string, cwd: string, token: string, branch?: string, maxParallel?: number}) {
  const cwd = options.cwd
  const token = options.token
  const name = options.name
  const branch = options.branch || 'internal/action-semaphore'
  const maxParallel = Math.max(1, options.maxParallel || 1)
  const id = options.id || randomUUID();

  let anchor: string | undefined

  return {id, init, start, stop, wait}

  async function init() {
    const cloneCommand = `git clone https://oauth2:${token}@github.com/${process.env.GITHUB_REPOSITORY}.git ${cwd} --branch ${branch} --single-branch --no-tags`
    try {
      await exec(`${cloneCommand} --shallow-since="3 hours ago"`)
    } catch {
      await exec(`${cloneCommand} --depth=1`)
    }
    await exec(`git config user.email "action-semaphore@applitools.com"`, [], {cwd})
    await exec(`git config user.name "semaphore-bot"`, [], {cwd})
  }

  async function start() {
    await exec(`git commit -m "semaphore: ${name} start ${id}" --allow-empty --no-verify`, [], {cwd})
    await sync()
    const {stdout} = await getExecOutput(`git log --format="tformat:%h" -n 1`, [], {cwd})
    anchor = stdout.trim()
  }

  async function stop() {
    await exec(`git commit -m "semaphore: ${name} stop ${id}" --allow-empty --no-verify`, [], {cwd})
    await sync()
  }

  async function wait() {
    const {stdout} = await getExecOutput(`git log ${anchor}^ --reverse --format="tformat:%s" --grep="^semaphore: ${name}" --since="3 hours ago"`, [], {cwd})
    let count = stdout.trim().split('\n').reduce((count, log) => {
      if (log.includes('start')) return count + 1
      if (log.includes('stop') && count > 0) return count - 1
      return count
    }, 0)

    while (count >= maxParallel) {
      await setTimeout(10_000)
      await exec(`git pull --rebase`, [], {cwd})
      const {stdout} = await getExecOutput(`git log ${anchor}.. --reverse --format="tformat:%h" --grep="^semaphore: ${name} stop"`, [], {cwd})
      if (stdout) {
        const hashes = stdout.trim().split('\n')
        count -= hashes.length
        anchor = hashes.at(-1)!
      }
    }
  }

  async function sync() {
    while (true) {
      try {
        await exec(`git pull --rebase`, [], {cwd})
        await exec(`git push`, [], {cwd})
        break
      } catch {
        continue
      }
    }
  }
}