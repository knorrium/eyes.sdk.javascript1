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
    all: Test[]
    emitted: EmittedTest[]
    errors: (Error & {tets: Test})[]
  }
}

export interface Test {
  key: string
  suite?: string
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
  transform?(test: Test): Test
  emitter(emitter: Emitter, test: Test): any
  template(options: {test: Test; commands: Record<string, string[]>}): string
}

export interface Fixture extends String {
  toPath(): string
  toBase64(): string
  toText(): string
}

export function makeFramework(options?: FrameworkOptions): Framework {
  const storage = {config: null as Record<string, any> | null, tests: [] as Test[]}

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
        storage.tests.push(merge(test, testVariant))
      })
    } else {
      storage.tests.push(test)
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
    if (storage.config) {
      console.log(chalk.yellow(`WARNING: tests configuration object was reset`))
    }
    storage.config = config
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

  function emit({filter, transform, template, emitter}: EmitOptions): {
    all: Test[]
    emitted: EmittedTest[]
    errors: (Error & {tets: Test})[]
  } {
    const result = {
      all: [] as Test[],
      emitted: [] as EmittedTest[],
      errors: [] as (Error & {tets: Test})[],
    }
    for (const test of storage.tests) {
      if (filter && !filter(test)) continue
      const transformedTest = transform?.({...test}) ?? {...test}
      if (storage.config?.pages[transformedTest.page!]) {
        transformedTest.page = storage.config?.pages[transformedTest.page!]
      }
      transformedTest.config ??= {}
      transformedTest.config.baselineName = transformedTest.config?.baselineName || transformedTest.key
      result.all.push(transformedTest)
      if (transformedTest.skipEmit) continue
      try {
        if (!utils.types.isFunction(transformedTest.test)) {
          throw new Error(`Missing implementation for test ${transformedTest.name}`)
        }
        const emittedTest = {...transformedTest} as EmittedTest
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
        emittedTest.test.call(context, {...emittedTest, ...sdk})
        emittedTest.code = template({test: emittedTest, commands})
        result.emitted.push(emittedTest)
      } catch (error: any) {
        error.test = transformedTest
        result.errors.push(error)
      }
    }
    return result
  }
}
