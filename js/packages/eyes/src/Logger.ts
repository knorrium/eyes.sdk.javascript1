import type * as logger from '@applitools/logger'
import * as utils from '@applitools/utils'
import {makeLogger} from '@applitools/logger'
import {
  LogHandler,
  LogHandlerData,
  FileLogHandlerData,
  ConsoleLogHandlerData,
  NullLogHandlerData,
} from './input/LogHandler'

export class Logger {
  private _logger?: logger.Logger
  private _options: {show?: boolean; label?: string; handler?: LogHandler} = {}

  private _makeLogger() {
    return makeLogger({
      handler:
        this._options.handler && this._options.handler instanceof LogHandlerData
          ? this._options.handler.toJSON()
          : this._options.handler,
      level: this._options.show || utils.general.getEnvValue('SHOW_LOGS', 'boolean') ? 'info' : 'silent',
      format: {label: this._options.label},
    })
  }

  /** @internal */
  readonly isLogger = true

  /** @internal */
  constructor(logger?: logger.Logger)
  constructor(options?: {show?: boolean; label?: string; handler?: LogHandler})
  constructor(show?: boolean)
  constructor(
    loggerOrOptionsOrShow: logger.Logger | {show?: boolean; label?: string; handler?: LogHandler} | boolean = false,
  ) {
    if (utils.types.isBoolean(loggerOrOptionsOrShow)) {
      return new Logger({show: loggerOrOptionsOrShow})
    } else if (utils.types.has(loggerOrOptionsOrShow, ['log', 'console'])) {
      this._logger = loggerOrOptionsOrShow
    } else {
      this._options = loggerOrOptionsOrShow
    }
  }

  /** @internal */
  getLogger() {
    if (!this._logger) this._logger = this._makeLogger()
    return this._logger
  }

  getLogHandler(): LogHandlerData | ConsoleLogHandlerData | FileLogHandlerData {
    if (this._options.handler) {
      if (!utils.types.has(this._options.handler, 'type')) {
        return this._options.handler as LogHandlerData
      } else if (this._options.handler.type === 'file') {
        return new FileLogHandlerData(true, this._options.handler.filename, this._options.handler.append)
      } else if (this._options.handler.type === 'console') {
        return new ConsoleLogHandlerData(true)
      }
    }
    return new NullLogHandlerData()
  }
  setLogHandler(handler: LogHandler) {
    this._options.handler = handler
    this._options.show = true
  }

  verbose(...messages: any[]) {
    if (!this._logger) this._logger = this._makeLogger()
    messages.forEach(message => this._logger!.log(message))
  }

  log(...messages: any[]) {
    if (!this._logger) this._logger = this._makeLogger()
    messages.forEach(message => this._logger!.log(message))
  }

  warn(...messages: any[]) {
    if (!this._logger) this._logger = this._makeLogger()
    messages.forEach(message => this._logger!.warn(message))
  }

  error(...messages: any[]) {
    if (!this._logger) this._logger = this._makeLogger()
    messages.forEach(message => this._logger!.error(message))
  }

  fatal(...messages: any[]) {
    if (!this._logger) this._logger = this._makeLogger()
    messages.forEach(message => this._logger!.fatal(message))
  }

  open() {
    this._logger?.open()
  }

  close() {
    this._logger?.close()
  }

  /** @internal */
  extend(label?: string): Logger {
    if (this._logger) return new Logger(this._logger.extend({label}))
    return new Logger({
      show: this._options.show,
      label: label ?? this._options.label,
      handler: this._options.handler,
    })
  }
}
