import * as core from '@actions/core'
import {makeTask} from './task.js'

post()
  .catch(err => {
    core.debug(err)
    core.setFailed(err.message)
  })

async function post() {
  const name = core.getInput('name')
  if (name) {
    const task = await makeTask({name})
    await task.stop()
  }
}
