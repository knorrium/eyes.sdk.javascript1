import type {MaybeArray} from '@applitools/utils'
import {type Test, type Override} from './framework.js'

export interface GenericConfig {
  /**
   * Path or url to a base config file
   */
  extends?: string
  /**
   * Path or url to an implementation file
   */
  tests: string
  /**
   * Path or url to a emitter spec
   */
  emitter: string
  /**
   * Path or url to a hbs template file
   */
  template: string
  /**
   * Output patter for emitted files
   */
  output: string
  /**
   * Path or url to an implementation file
   */
  overrides?: MaybeArray<string | Override>
  /**
   * Filter out irrelevant tests
   */
  filter?: (test: Test) => boolean
  /**
   * Suite name
   */
  suite?: string
  /**
   * Suites declaration
   */
  suites?: Record<string, (test: Test) => boolean>
  /**
   * Path to directory or url to zip with fixtures
   */
  fixtures?: string
  /**
   * Meta config
   */
  meta?: {output?: string; pascalize?: boolean}
  /**
   * Environment variables
   */
  env?: Record<string, string>
  /**
   * Wether to throw if one of test failed to generate
   */
  strict?: boolean
  /**
   * Prettier configuration
   */
  format?: any
}
