import type {FormatOptions, ColoringOptions} from './types'
import {colorize} from './colorize'
import {inspect} from 'util'
import * as utils from '@applitools/utils'

const defaultColorTheme = {
  label: 'cyan',
  tags: 'blueBright',
  timestamp: 'greenBright',
  level: {
    info: ['bgBlueBright', 'black'],
    warn: ['bgYellowBright', 'black'],
    error: ['bgRedBright', 'white'],
    fatal: ['bgRed', 'white'],
  },
} as ColoringOptions

export function formatter(
  chunks: any[],
  {prelude = true, label, timestamp = new Date(), level = 'info', tags, colors}: FormatOptions = {},
) {
  if (utils.types.isBoolean(colors)) colors = colors ? defaultColorTheme : undefined
  const message = []
  if (prelude) {
    if (label) {
      const text = label
      const color = colors?.label
      message.push(color ? colorize(text, {color}) : text)
    }
    if (tags && !utils.types.isEmpty(tags)) {
      const text = `(${
        utils.types.isArray(tags[0]) ? (tags as string[][]).map(tags => tags.join('/')).join(' & ') : tags.join('/')
      })`
      const color = colors?.tags
      message.push(color ? colorize(text, {color}) : text)
    }
    if (!colors && (label || (tags && !utils.types.isEmpty(tags)))) {
      message.push('|')
    }
    if (timestamp) {
      timestamp = timestamp === true ? new Date() : timestamp
      const text = timestamp.toISOString()
      const color = colors?.timestamp
      message.push(color ? colorize(text, {color}) : text)
    }
    if (level) {
      const text = level.toUpperCase().padEnd(5)
      const color = colors?.level?.[level]
      message.push(color ? colorize(` ${text} `, {color}) : `[${text}]`)
    }
  }

  if (chunks && chunks.length > 0) {
    const color = colors?.message
    const strings = chunks.map(chunk => {
      return utils.types.isString(chunk)
        ? colorize(chunk, {color})
        : inspect?.(chunk, {colors: Boolean(colors), compact: 5, depth: 5})
    })
    message.push(strings.join(' '))
  }

  return message.join(' ')
}
