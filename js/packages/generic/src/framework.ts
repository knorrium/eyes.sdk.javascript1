import {readFileSync} from 'fs'
import {merge} from './utils/merge.js'
import {makeEmitter, type Emitter} from './emitter.js'
import chalk from 'chalk'
import * as utils from '@applitools/utils'

export interface Framework {
  test(name: string, test: Test): void
  config(config: Record<string, any>): void
  fixture(path: string): Fixture
  emit(options: EmitOptions): {
    tests: EmittedTest[]
    errors: {error: any; test: Test}[]
    skipped: number
    skippedEmit: number
  }
}

export interface Test {
  key: string
  name: string
  group: string
  variant?: string
  test(...args: any[]): void

  features?: string[]
  page?: string
  env?: Record<string, any>
  config?: Record<string, any>
  skip?: boolean
  skipEmit?: boolean
  reason?: string
  variants?: Record<string, Test & {variant: string}>
}

export interface EmittedTest extends Test {
  tags: string[]
  meta: {features?: string[]; browser?: string; emulator: boolean; mobile: boolean; native: boolean; headfull: boolean}
  code: string
}

export type Override = Record<string, Partial<Test>> | ((test: Test) => Partial<Test>)

export interface FrameworkOptions {
  fixtures?: string
}

export interface EmitOptions {
  filter?(test: Test): boolean
  override(test: Test): Test
  emitter(emitter: Emitter, test: Test): any
  template(options: {test: Test; commands: Record<string, string[]>}): string
}

export interface Fixture extends String {
  toPath(): string
  toBase64(): string
  toText(): string
}

export function makeFramework(options?: FrameworkOptions): Framework {
  const context = {config: null as Record<string, any> | null, tests: [] as Test[]}

  return {test, config, fixture, emit}

  function test(name: string, {variants, ...test}: Test): void {
    test.group = name
    test.key = test.key || toPascalCase(name)
    test.name = name
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
  }

  function config(config: Record<string, any>): void {
    if (context.config) {
      console.log(chalk.yellow(`WARNING: tests configuration object was reset`))
    }
    context.config = config
  }

  function fixture(path: string): Fixture {
    if (!options?.fixtures) {
      console.log(chalk.yellow(`WARNING: fixture with path "${path}" is used, but source of fixtures is not provided`))
    }

    const fixture = new String((options?.fixtures ?? '') + path) as Fixture
    fixture.toPath = () => fixture.toString()
    fixture.toBase64 = () => (options?.fixtures && readFileSync(fixture.toString()).toString('base64'))!
    fixture.toText = () => (options?.fixtures && readFileSync(fixture.toString()).toString())!
    return fixture
  }

  function emit({filter, override, template, emitter}: EmitOptions): {
    tests: EmittedTest[]
    errors: {error: any; test: Test}[]
    skipped: number
    skippedEmit: number
  } {
    return context.tests.reduce(
      (result, test) => {
        if (filter && !filter(test)) {
          return result
        }
        test = override({...test, page: test.page && context.config?.pages[test.page]})
        if (test.skipEmit) {
          result.skippedEmit += 1
          return result
        }
        try {
          if (!utils.types.isFunction(test.test)) {
            throw new Error(`Missing implementation for test ${test.name}`)
          }
          const emittedTest = {...test} as EmittedTest
          emittedTest.config ??= {}
          emittedTest.config.baselineName = emittedTest.config.baselineName || test.key
          emittedTest.meta = {
            features: test.features,
            browser: test.env?.browser,
            emulator: Boolean(test.env?.emulation),
            mobile: Boolean(test.env?.device),
            native: Boolean(test.env?.device && !test.env.browser),
            headfull: test.env?.headless === false,
          }
          emittedTest.tags = Object.entries(emittedTest.meta).reduce((tags, [name, value]) => {
            if (utils.types.isArray(value)) tags.push(...value)
            else if (utils.types.isString(value)) tags.push(value.replace(/-[\d.]+$/, ''))
            else if (value) tags.push(name)
            return tags
          }, [] as string[])
          const {commands, context, ...api} = makeEmitter()
          const sdk = emitter(api, emittedTest)
          if (emittedTest.page) sdk.driver.visit(emittedTest.page)
          test.test.call(context, {...test, ...sdk})
          emittedTest.code = template({test, commands})
          result.tests.push(emittedTest)
          if (test.skip) result.skipped += 1
        } catch (error: any) {
          result.errors.push({test, error})
        }
        return result
      },
      {
        tests: [] as EmittedTest[],
        errors: [] as {error: AnalyserNode; test: Test}[],
        skipped: 0,
        skippedEmit: 0,
      },
    )
  }
}
