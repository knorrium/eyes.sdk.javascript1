import {makeTask} from './task.js'
import * as os from 'os'
import * as path from 'path'
import * as core from '@actions/core'

run()
  .catch(err => {
    core.debug(err)
    core.setFailed(err.message)
  })

async function run() {
  const cwd = path.join(os.tmpdir(), 'queue-repo')
  const name = core.getInput('name', {required: true})
  const token = core.getInput('token', {required: true})
  const maxParallel = Number.parseInt(core.getInput('max-parallel'))
  const id = core.getState('task-id')

  const task = makeTask({id, name, cwd, token, maxParallel})
  if (!id) {
    await task.init()
    await task.start()
    core.saveState('task-id', task.id)
    await task.wait()
  } else {
    await task.stop()
  }
}
