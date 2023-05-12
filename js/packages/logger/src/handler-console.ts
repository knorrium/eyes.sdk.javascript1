/* eslint no-console: off */

import type {Handler} from './types'

export function makeConsoleHandler(): Handler {
  return {log, warn, error}

  function log(message: string) {
    console.log(message)
  }

  function warn(message: string) {
    console.warn(message)
  }

  function error(message: string) {
    console.error(message)
  }
}
