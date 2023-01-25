import {type Handler} from './handler'
import debug from 'debug'

const loggerMap = new Map<string, debug.Debugger>()
const mainLogger = debug('appli')

export type DebugHandler = {
  type: 'debug'
  label: string
}

export function makeDebugHandler({label: originalLabel}: Omit<DebugHandler, 'type'> = {label: 'no-label'}): Handler {
  let logger: debug.Debugger = null
  const label = originalLabel.replace(/ /g, '-').toLowerCase()
  if (loggerMap.has(label)) {
    logger = loggerMap.get(label)
  } else {
    logger = mainLogger.extend(label)
    loggerMap.set(label, logger)
  }
  return {log}
  function log(message: string) {
    logger(message)
  }
}
