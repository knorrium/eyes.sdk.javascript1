#!/usr/bin/env node

const yargs = require('yargs')
const chalk = require('chalk')
const {sendTestReport} = require('../qa/send-report')
const {sendReleaseNotification} = require('../qa/send-notification')
const {getLatestReleaseEntries} = require('../changelog/query')

yargs
  .config({cwd: process.cwd()})
  .command(require('../changelog/command'))
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
  .command({
    command: 'latest-release-entry',
    handler: async () => {
      const changelog = getLatestReleaseEntries({targetFolder: process.cwd()}).join('\n')
      console.log(changelog)
    },
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
