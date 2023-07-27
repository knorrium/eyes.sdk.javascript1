import type {GenericConfig} from './types.js'
import {prepareConfig} from './utils/prepare-config.js'
import {downloadFixtures} from './utils/download-fixtures.js'
import {prepareOverride} from './utils/prepare-override.js'
import {saveTests} from './utils/save-tests.js'
import {saveMeta} from './utils/save-meta.js'
import chalk from 'chalk'
import * as utils from '@applitools/utils'

export async function generate(config: GenericConfig): Promise<void> {
  try {
    config = await prepareConfig(config)
    if (config.env) Object.entries(config.env).forEach(([key, value]) => (process.env[key] = value))

    console.log(`Generating code for file ${config.tests}...\n`)

    const fixtures = config.fixtures ? await downloadFixtures(config.fixtures) : undefined
    const filter = utils.types.isFunction(config.suite) ? config.suite : config.suites?.[config.suite as string]
    const override = await prepareOverride(config.overrides)
    const {emitter} = await import(config.emitter)
    const {template} = await import(config.template, {assert: {format: 'template'}})
    const {emit} = await import(config.tests, {assert: {format: 'tests'}})
    const {tests, errors, skipped, skippedEmit} = await emit({fixtures, filter, override, emitter, template})

    if (errors.length > 0) {
      if (config.strict) {
        const [{test, error}] = errors
        console.log(chalk.red(`Error during emitting test "${test.name}":`))
        throw error
      }
      errors.forEach(({test, error}: any) => {
        console.log(chalk.red(`Error during emitting test "${test.name}":`))
        console.log(chalk.grey(error.stack))
      })
    }

    await saveTests(tests, config)
    await saveMeta(tests, config.meta)

    console.log(chalk.green(`${chalk.bold(`${tests.length}`.padEnd(3))} test(s) generated`))
    console.log(chalk.cyan(`${chalk.bold(`${skipped}`.padEnd(3))} test(s) skipped execution`))
    console.log(chalk.cyan(`${chalk.bold(`${skippedEmit}`.padEnd(3))} test(s) skipped emit`))
    console.log(chalk.red(`${chalk.bold(`${errors.length}`.padEnd(3))} error(s) occurred`))
  } catch (error: any) {
    console.log(chalk.red(error.stack))
    process.exit(1)
  }
}
