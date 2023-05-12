import type {Logger, LoggerOptions, LogLevelName, Handler} from './types'
import {makeConsoleHandler} from './handler-console'
import {makeFileHandler} from './handler-file'
import {makeRollingFileHandler} from './handler-rolling-file'
import {makeDebugHandler} from './handler-debug'
import {makePrinter} from './printer'
import {LogLevel} from './log-level'
import {colorize} from './colorize'
import {formatter as defaultFormatter} from './formatter'
import * as utils from '@applitools/utils'

export function makeLogger({logger: baseLogger, ...options}: LoggerOptions & {extended?: boolean} = {}): Logger {
  if (baseLogger) return baseLogger.extend({level: options.level, ...options.format})
  options.console ??= true
  options.format ??= {}
  options.format.formatter ??= defaultFormatter
  options.format.colors ??= utils.general.getEnvValue('LOG_COLORS', 'boolean')

  let forceInitHandler: boolean
  if (!options.handler) {
    if (process.env.APPLITOOLS_LOG_FILE) {
      options.handler = {type: 'file', filename: process.env.APPLITOOLS_LOG_FILE}
    } else if (process.env.APPLITOOLS_LOG_DIR) {
      options.handler = {type: 'rolling file', dirname: process.env.APPLITOOLS_LOG_DIR}
    } else if (process.env.APPLITOOLS_SHOW_LOGS === 'true') {
      options.handler = {type: 'console'}
    } else if (process.env.DEBUG) {
      options.handler = {type: 'debug', label: options.format.label}
      options.level = LogLevel.all
      options.format.label = undefined
      options.format.timestamp = false
      forceInitHandler = true
    } else {
      options.handler = {type: 'console'}
    }
  }

  if (!utils.types.isNumber(options.level)) {
    options.level =
      options.level ??
      (process.env.APPLITOOLS_LOG_LEVEL as LogLevelName) ??
      (process.env.APPLITOOLS_SHOW_LOGS === 'true' ? 'all' : 'silent')
    options.level = LogLevel[options.level] ?? LogLevel.silent
  }

  if (utils.types.has(options.handler, 'type')) {
    if (options.handler.type === 'console') {
      options.handler = makeConsoleHandler()
    } else if (options.handler.type === 'debug') {
      options.handler = makeDebugHandler({label: options.format.label, ...options.handler})
    } else if (options.handler.type === 'file') {
      options.handler = makeFileHandler(options.handler)
      options.format.colors = false
    } else if (options.handler.type === 'rolling file') {
      options.handler = makeRollingFileHandler(options.handler)
      options.format.colors = false
    }
  } else if (!utils.types.isFunction(options.handler, 'log')) {
    throw new Error('Handler have to implement `log` method or use one of the built-in handler names under `type` prop')
  }

  options.console = options.console
    ? utils.types.isObject(options.console)
      ? options.console
      : makeConsoleHandler()
    : options.handler

  const logger: Logger = {
    isLogger: true,
    options,
    console: makePrinter({handler: options.console, level: LogLevel.all, format: {...options.format, prelude: false}}),
    ...makePrinter({handler: options.handler, level: options.level, format: options.format}),
    extend(optionsOrLogger, extraOptions) {
      const extendOptions = [options]
      if (utils.types.has(optionsOrLogger, 'isLogger')) {
        if (optionsOrLogger !== logger) extendOptions.push(optionsOrLogger.options)
        if (extraOptions)
          extendOptions.push({console: extraOptions.console, level: extraOptions.level, format: extraOptions})
      } else if (optionsOrLogger) {
        extendOptions.push({console: optionsOrLogger.console, level: optionsOrLogger.level, format: optionsOrLogger})
      }
      const extendedOptions = mergeOptions(...extendOptions)
      if (forceInitHandler && extendedOptions.handler === options.handler) {
        extendedOptions.handler = undefined
      }
      return makeLogger(extendedOptions)
    },
    colorize,
    open() {
      if (!options.extended) (options.handler as Handler).open?.()
    },
    close() {
      if (!options.extended) (options.handler as Handler).close?.()
    },
  }

  return logger
}

export function mergeLoggers(...loggers: Logger[]): Logger {
  if (loggers.length === 1) return loggers[0]
  const mergedOptions = mergeOptions(
    ...loggers.map(logger => {
      return {
        ...logger.options,
        format: {
          ...logger.options.format,
          tags:
            logger.options.format?.tags &&
            (utils.types.isArray(logger.options.format.tags[0])
              ? (logger.options.format.tags as string[][])
              : [logger.options.format.tags as string[]]),
        },
      }
    }),
  )
  return makeLogger(mergedOptions)
}

function mergeOptions(...options: LoggerOptions[]): LoggerOptions {
  return options.reduce((baseOptions, currentOptions) => {
    return {
      ...baseOptions,
      ...currentOptions,
      format: {
        ...baseOptions.format,
        ...currentOptions.format,
        tags: mergeTags(baseOptions.format?.tags ?? [], currentOptions.format?.tags ?? []),
      },
    }
  }, {})
}

function mergeTags(...tags: (string[] | string[][])[]): string[] | string[][] {
  return tags.reduce((baseTags, currentTags) => {
    if (utils.types.isArray(baseTags[0])) {
      let mergedTags = (baseTags as string[][]).map(baseTags => [...baseTags])
      if (utils.types.isArray(currentTags[0])) {
        mergedTags.push(...(currentTags as string[][]).map(currentTags => [...currentTags]))
      } else {
        mergedTags = mergedTags.map(mergedTags => [
          ...new Set([...(mergedTags as string[]), ...(currentTags as string[])]),
        ])
      }
      return mergedTags
    } else {
      return utils.types.isArray(currentTags[0])
        ? [...(baseTags as string[][]), ...(currentTags as string[][])]
        : [...new Set([...(baseTags as string[]), ...(currentTags as string[])])]
    }
  }, [] as string[] | string[][])
}
