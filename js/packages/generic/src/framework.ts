import {extractCallSite} from './utils/extract-call-site.js'
import {readFileSync} from 'fs'
import {merge} from './utils/merge.js'
import {makeEmitter, type Emitter} from './emitter.js'
import chalk from 'chalk'
import * as utils from '@applitools/utils'

export interface Framework {
  test(name: string, test: Test): void
  config(config: Record<string, any>): void
  fixture(path: string): Fixture
  emit(options: {
    override(test: Test): Test
    template(options: {test: Test; commands: Record<string, string[]>}): string
    emitter(emitter: Emitter, test: Test): any
  }): Promise<{
    tests: Test[]
    skippedTestCount: number
    skippedEmitTestCount: number
    errors: {test: Test; error: any}[]
  }>
}

export interface FrameworkOptions {
  fixtures?: string
}

export interface Test {
  key: string
  group: string
  name: string
  variant?: string
  variants?: Record<string, Test & {variant: string}>
  env?: Record<string, any>
  page?: string
  config?: Record<string, any>
  features?: string[]
  skip?: boolean
  skipEmit?: boolean
  test(...args: any[]): void
  tags: string[]
  meta: {features?: string[]; browser?: string; emulator: boolean; mobile: boolean; native: boolean; headfull: boolean}
  source: {line: number | null}
  code: string
}

export type Override = Record<string, Test> | ((test: Test) => Test)

export interface Fixture extends String {
  toPath(): string
  toBase64(): string
  toText(): string
}

export function makeFramework(options?: FrameworkOptions): Framework {
  const context = {config: null as Record<string, any> | null, tests: [] as Test[]}

  return {
    test(name: string, {variants, ...test}: Test): void {
      test.group = name
      test.key = test.key || toPascalCase(name)
      test.name = name
      test.source = {line: extractCallSite(2).getLineNumber()}
      if (variants) {
        Object.entries(variants).forEach(([variant, testVariant]) => {
          testVariant.key = testVariant.key || test.key + toPascalCase(variant)
          testVariant.name = variant ? `${test.name} ${variant}` : test.name
          testVariant.variant = variant
          context.tests.push(merge(test, testVariant))
        })
      } else {
        context.tests.push(test)
      }

      function toPascalCase(value: string) {
        if (!value) return value
        return value
          .split(' ')
          .map(value => value[0].toUpperCase() + value.substring(1))
          .join('')
      }
    },

    config(config: Record<string, any>): void {
      if (context.config) {
        console.log(chalk.yellow(`WARNING: tests configuration object was reset`))
      }
      context.config = config
    },

    fixture(path: string): Fixture {
      if (!options?.fixtures) {
        console.log(
          chalk.yellow(`WARNING: fixture with path "${path}" is used, but source of fixtures is not provided`),
        )
      }

      const fixture = new String((options?.fixtures ?? '') + path) as Fixture
      fixture.toPath = () => fixture.toString()
      fixture.toBase64 = () => (options?.fixtures && readFileSync(fixture.toString()).toString('base64'))!
      fixture.toText = () => (options?.fixtures && readFileSync(fixture.toString()).toString())!
      return fixture
    },
    async emit({override, template, emitter: spec}) {
      const tests = context.tests.map(test => override({...test, page: test.page && context.config?.pages[test.page]}))
      const emittedTests = []
      const errors = []
      let skippedTestCount = 0
      let skippedEmitTestCount = 0
      for (const test of tests) {
        if (!test.skipEmit) {
          try {
            if (!utils.types.isFunction(test.test)) {
              throw new Error(`Missing implementation for test ${test.name}`)
            }
            test.config ??= {}
            test.config.baselineName = test.config.baselineName || test.key
            test.meta = {features: test.features} as Test['meta']
            if (test.env) {
              test.meta.browser = test.env.browser
              test.meta.emulator = Boolean(test.env.emulation)
              test.meta.mobile = Boolean(test.env.device)
              test.meta.native = Boolean(test.env.device && !test.env.browser)
              test.meta.headfull = test.env.headless === false
            }
            test.tags = Object.entries(test.meta).reduce((tags, [name, value]) => {
              if (utils.types.isArray(value)) tags.push(...value)
              else if (utils.types.isString(value)) tags.push(value.replace(/-[\d.]+$/, ''))
              else if (value) tags.push(name)
              return tags
            }, [] as string[])

            const emitter = makeEmitter()
            const sdk = spec(emitter, test)
            if (test.page) sdk.driver.visit(test.page)
            test.test.call(emitter.context, {...test, ...sdk})
            test.code = template({test, commands: emitter.commands})
            emittedTests.push(test)
            if (test.skip) skippedTestCount += 1
          } catch (error: any) {
            errors.push({test, error})
          }
        } else {
          skippedEmitTestCount += 1
        }
      }
      return {tests: emittedTests, skippedTestCount, skippedEmitTestCount, errors}
    },
  }
}
