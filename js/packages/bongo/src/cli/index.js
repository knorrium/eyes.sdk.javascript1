#!/usr/bin/env node

const fs = require('fs')
const yargs = require('yargs')
const chalk = require('chalk')
const msee = require('msee')
const ms = require('ms')
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
        package: {
          type: 'string',
          description: 'name of the package',
        },
        since: {
          type: 'string',
          description: 'generate changelog for a time period started since date',
          coerce: since => (since.endsWith(' ago') ? Date.now() - ms(since.slice(0, -4)) : Date.parse(since)),
        },
        file: {
          type: 'string',
          descriptions: 'file to save changelog',
          coerce: file => (file === '' ? true : file),
        },
      }),
    async handler(options) {
      if (!options.repo) options.repo = 'https://github.com/applitools/eyes.sdk.javascript1'
      const {default: inquirer} = await import('inquirer')
      const {default: DatePrompt} = await import('inquirer-date-prompt')
      inquirer.registerPrompt('date', DatePrompt)

      const interactive = !options.tag
      if (interactive) {
        const formatter = Intl.DateTimeFormat('en', {dateStyle: 'long'})
        const releasesPromise = getReleases({...options, limit: 500})

        options = await inquirer.prompt(
          [
            {
              type: 'confirm',
              name: 'shouldInputDate',
              prefix: '❓',
              message: 'Do you want to choose a date?',
              when: ({since}) => !since,
            },
            {
              type: 'date',
              name: 'since',
              prefix: '🗓️ ',
              message: 'Choose a date:',
              when: ({shouldInputDate}) => shouldInputDate,
              locale: 'en-US',
              format: {month: 'short', year: undefined, hour: undefined, minute: undefined},
            },
            {
              type: 'list',
              name: 'package',
              prefix: '📦',
              message: 'Choose a package:',
              pageSize: 10,
              choices: async ({since}) => {
                const releases = await releasesPromise
                return Object.entries(releases)
                  .filter(([_, release]) => !since || release.some(({createdAt}) => Date.parse(createdAt) >= since))
                  .map(([name, release]) => ({
                    name: `${name} ${chalk.grey(`(latest ${formatter.format(release[0].createdAt)})`)}`,
                    value: name,
                  }))
              },
            },
            {
              type: 'list',
              name: 'tag',
              prefix: '🔥',
              message: 'Choose a version:',
              pageSize: 10,
              when: ({since}) => !since,
              choices: async ({since, package}) => {
                const releases = await releasesPromise
                return releases[package]
                  .filter(({createdAt}) => !since || Date.parse(createdAt) >= since)
                  .map(({version, tag, createdAt}) => ({
                    name: `${version} ${chalk.grey(`(${formatter.format(createdAt)})`)}`,
                    value: tag,
                  }))
              },
            },
          ],
          options,
        )

        if (!options.tag && options.package) {
          const releases = await releasesPromise
          options.tag = releases[options.package]
            .filter(({createdAt}) => !options.since || Date.parse(createdAt) >= options.since)
            .map(({tag}) => tag)
        }
      }

      const changelog = await extractSimplifiedChangelog(options)

      if (options.file) {
        if (options.file === true) {
          options.file = `./${options.since ? options.package.replace('/', '-') : options.tag.replace('/', '-')}.md`
        }
        fs.writeFileSync(options.file, changelog)
        console.log(chalk.bold('✅ Changelog saved to the file:'), chalk.cyan(options.file))
      } else {
        console.log(msee.parse(changelog))
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
        recipient: {
          type: 'string',
          description: 'specific recipient for the notification',
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
        resultFormat: {
          aliases: ['format'],
          type: 'string',
          description: 'format of the report file',
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
