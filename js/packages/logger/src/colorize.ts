import type {Style} from './types'
import chalk from 'chalk'
import * as utils from '@applitools/utils'

export function colorize(string: string, {color}: {color?: Style | Style[]} = {}) {
  if (!color) return string
  if (!utils.types.isArray(color)) color = [color]
  return color.reduce<chalk.Chalk>((chalk, color) => chalk[color] ?? chalk, chalk)(string)
}
