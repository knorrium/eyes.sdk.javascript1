import type {Printer, PrinterOptions} from './types'
import {LogLevel} from './log-level'

export function makePrinter({handler, level, format}: PrinterOptions): Printer {
  const formatter = format?.formatter ?? ((chunks, options) => ({chunks, options, isRaw: true} as any))

  return {debug, log, info: log, warn, error, fatal, verbose: log}

  function debug(...messages: any[]) {
    if (level < LogLevel.debug) return
    const options = {...format, level: 'debug' as const}
    handler.log(formatter(messages, options))
  }
  function log(...messages: any[]) {
    if (level < LogLevel.info) return
    const options = {...format, level: 'info' as const}
    handler.log(formatter(messages, options))
  }
  function warn(...messages: any[]) {
    if (level < LogLevel.warn) return
    const options = {...format, level: 'warn' as const}
    if (handler.warn) handler.warn(formatter(messages, options))
    else handler.log(formatter(messages, options))
  }
  function error(...messages: any[]) {
    if (level < LogLevel.error) return
    const options = {...format, level: 'error' as const}
    if (handler.error) handler.error(formatter(messages, options))
    else handler.log(formatter(messages, options))
  }
  function fatal(...messages: any[]) {
    if (level < LogLevel.fatal) return
    const options = {...format, level: 'fatal' as const}
    if (handler.fatal) handler.fatal(formatter(messages, options))
    else if (handler.error) handler.error(formatter(messages, options))
    else handler.log(formatter(messages, options))
  }
}
