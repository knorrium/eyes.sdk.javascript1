import type {Handler, DebugHandler} from './types'
import debug from 'debug'

const mainLogger = debug('appli')

export function makeDebugHandler({label = 'no-label'}: Omit<DebugHandler, 'type'>): Handler {
  label = label.replace(/ /g, '-').toLowerCase()
  const logger = mainLogger.extend(label)
  return {log}

  function log(message: string) {
    logger(message)
  }
}
