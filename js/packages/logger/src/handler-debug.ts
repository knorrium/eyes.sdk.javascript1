import {type Handler} from './handler'
import debug from 'debug'

const mainLogger = debug('appli')

export type DebugHandler = {
  type: 'debug'
  label?: string
}

export function makeDebugHandler({label = 'no-label'}: Omit<DebugHandler, 'type'>): Handler {
  label = label.replace(/ /g, '-').toLowerCase()
  const logger = mainLogger.extend(label)
  return {log}

  function log(message: string) {
    logger(message)
  }
}
