#!/usr/bin/env node

const fs = require('fs')
const yargs = require('yargs')
const chalk = require('chalk')
const msee = require('msee')
const {sendTestReport} = require('../qa/send-report')
const {sendReleaseNotification} = require('../qa/send-notification')
const {extractSimplifiedChangelog} = require('../changelog/changelog')
const {getReleases} = require('../gh/gh')

yargs
  .config({cwd: process.cwd()})
  .command({
    command: 'changelog',
    description: 'Provides a production changelog for a specific package an version',
    builder: yargs =>
      yargs.options({
        tag: {
          type: 'string',
          description: 'release tag of the package',
        },
        file: {
          type: 'string',
          descriptions: 'file to save changelog',
          coerce: file => (file === '' ? true : file),
        },
      }),
    async handler({tag, repo = 'https://github.com/applitools/eyes.sdk.javascript1', file}) {
      const {default: inquirer} = await import('inquirer')
      const {default: DatePrompt} = await import('inquirer-date-prompt')

      inquirer.registerPrompt('date', DatePrompt)
      const interactive = !tag

      while (true) {
        if (interactive) {
          const formatter = Intl.DateTimeFormat('en', {dateStyle: 'long'})

          const answers = await inquirer.prompt([
            {
              name: 'versions',
              message: 'Package:',
              type: 'list',
              pageSize: 10,
              choices: async () => {
                const releases = await getReleases({
                  repo: 'https://github.com/applitools/eyes.sdk.javascript1',
                  limit: 100,
                })
                return Object.entries(releases).map(([name, release]) => ({
                  name: `${name} ${chalk.grey(`(latest ${formatter.format(release[0].createdAt)})`)}`,
                  value: release,
                }))
              },
            },
            {
              name: 'tag',
              message: 'Version:',
              type: 'list',
              pageSize: 10,
              choices: ({versions}) => {
                return versions.map(({version, tag, createdAt}) => ({
                  name: `${version} ${chalk.grey(`(${formatter.format(createdAt)})`)}`,
                  value: tag,
                }))
              },
            },
          ])
          tag = answers.tag
        }

        const changelog = await extractSimplifiedChangelog({tag, repo})
        if (file) {
          if (file === true) file = `./${tag.replace('/', '-')}.md`
          fs.writeFileSync(file, changelog)
          console.log(chalk.green('✓'), chalk.bold('Changelog saved to the file:'), chalk.cyan(file))
        } else {
          console.log(msee.parse(changelog))
        }

        if (interactive) {
          const {restart} = await inquirer.prompt({
            name: 'restart',
            message: 'Do you want to continue?',
            type: 'confirm',
            default: false,
          })
          if (!restart) return
        }
      }
    },
  })
  .command({
    command: ['send-release-notification'],
    description: 'Send a notification that an sdk has been released',
    builder: yargs =>
      yargs.options({
        reportId: {
          type: 'string',
          description: 'report id',
        },
        name: {
          type: 'string',
          description: 'the sdk name',
        },
        releaseVersion: {
          type: 'string',
          description: 'the sdk version name',
        },
      }),
    handler: sendReleaseNotification,
  })
  .command({
    command: ['send-test-report', 'report'],
    description: 'send a test report to QA dashboard',
    builder: yargs =>
      yargs.options({
        reportId: {
          type: 'string',
          describe: 'id of the report which will be displayed at the dashboard',
        },
        name: {
          type: 'string',
          description: 'the package name',
          demandOption: true,
        },
        group: {
          type: 'string',
          description: 'the package group',
        },
        resultPath: {
          type: 'string',
          description: 'path to the report file',
        },
        metaPath: {
          type: 'string',
          description: 'path to the json metadata file generated with tests',
        },
        params: {
          type: 'string',
          description: 'json parameters',
          coerce: params => {
            params = params.trim()
            return params ? JSON.parse(params) : undefined
          },
        },
        sandbox: {
          type: 'boolean',
          description: `send a result report to the sandbox QA dashboard instead of prod`,
        },
      }),
    handler: sendTestReport,
  })
  .demandCommand(1, 'exit')
  .fail((msg, error, args) => {
    if (msg === 'exit') {
      return args.showHelp()
    }
    const command = process.argv[2]
    if (process.argv.includes('--verbose')) {
      console.log(error)
    } else {
      console.log(chalk.red(error.message))
      console.log(`run "npx bongo ${command} --verbose" to see stack trace`)
    }
    process.exit(1)
  })
  .wrap(yargs.terminalWidth())
  .help().argv
