import * as core from '@actions/core'
import {makeTask} from './task.js'

main()
  .catch(err => {
    core.debug(err)
    core.setFailed(err.message)
  })

async function main() {
  const name = core.getInput('name')
  const maxParallel = Number.parseInt(core.getInput('max-parallel'))
  if (!name) return core.info('Queue name is not specified')

  const task = await makeTask({name, maxParallel})
  await task.start()
  await task.wait()
}
