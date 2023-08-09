import type {GenericConfig} from './types.js'
import {type Test} from './framework.js'
import {prepareConfig} from './utils/prepare-config.js'
import {downloadFixtures} from './utils/download-fixtures.js'
import {prepareTransform} from './utils/prepare-transform.js'
import {saveTests} from './utils/save-tests.js'
import {saveMeta} from './utils/save-meta.js'
import chalk from 'chalk'
import * as utils from '@applitools/utils'

export async function generate(config: GenericConfig): Promise<void> {
  try {
    config = await prepareConfig(config)
    if (config.env) Object.entries(config.env).forEach(([key, value]) => (process.env[key] = value))

    console.log(`Generating tests for file ${config.tests}${config.suite ? ` and suite ${config.suite}` : ''}...\n`)

    const fixtures = config.fixtures ? await downloadFixtures(config.fixtures) : undefined
    const filter = (test: Test) =>
      (!config.filter || config.filter(test)) &&
      (!config.suite || !config.suites?.[config.suite] || config.suites?.[config.suite](test))
    const transform = await prepareTransform(config.overrides)
    const {emitter} = await import(config.emitter)
    const {template} = await import(config.template, {assert: {format: 'template'}})
    const {emit} = await import(config.tests, {assert: {format: 'tests'}})
    const tests = await emit({fixtures, filter, transform, emitter, template})

    if (tests.errors.length > 0) {
      if (config.strict) {
        const [error] = tests.errors
        console.log(chalk.red(`Error during emitting test "${error.test.name}":`))
        throw error
      } else {
        tests.errors.forEach((error: any) => {
          console.log(chalk.red(`Error during emitting test "${error.test.name}":`))
          console.log(chalk.grey(error.stack))
        })
      }
    }

    await Promise.all([
      saveTests(tests.emitted, config),
      saveMeta(tests.all, {
        ...config.meta,
        params: {suite: utils.types.isFunction(config.suite) ? 'unknown' : config.suite},
      }),
    ])

    console.log(chalk.green(`${chalk.bold(`${tests.emitted.length}`.padEnd(3))} test(s) generated`))
    const skippedCount = (tests.emitted as any[]).reduce((count, test) => count + (test.skip ? 1 : 0), 0)
    console.log(chalk.cyan(`${chalk.bold(`${skippedCount}`.padEnd(3))} test(s) skipped execution`))
    const skippedEmitCount = tests.all.length - tests.emitted.length
    console.log(chalk.cyan(`${chalk.bold(`${skippedEmitCount}`.padEnd(3))} test(s) skipped emit`))
    console.log(chalk.red(`${chalk.bold(`${tests.errors.length}`.padEnd(3))} error(s) occurred`))
  } catch (error: any) {
    console.log(chalk.red(error.stack))
    process.exit(1)
  }
}
