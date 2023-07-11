#!/usr/bin/env node

const yargs = require('yargs')
const chalk = require('chalk')
const path = require('path')
const {getLatestReleaseEntries} = require('../changelog/query')
const log = require('../log')
const released = require('../released')
const {sendTestReport} = require('../qa/send-report')
const {sendReleaseNotification} = require('../qa/send-notification')

const pendingChangesFilePath = path.join(process.cwd(), '..', '..', '..', 'pending-changes.yaml')

yargs
  .config({cwd: process.cwd()})
  .command(
    ['released', 'release'],
    'Show which SDK versions contain a given package version or commit',
    {
      filterBySDK: {type: 'boolean', default: true},
      packageName: {alias: 'p', type: 'string'},
      sha: {type: 'string'},
      version: {alias: 'v', type: 'number'},
      versionsBack: {alias: 'n', type: 'number', default: 1},
      pendingChangesFilePath: {type: 'string', default: pendingChangesFilePath},
    },
    async args => {
      await released({args})
    },
  )
  .command(
    ['log', 'logs'],
    'Show commit logs for a given package',
    {
      packageName: {alias: 'p', type: 'string'},
      lowerVersion: {alias: 'lv', type: 'string'},
      upperVersion: {alias: 'uv', type: 'string'},
      expandAutoCommitLogEntries: {alias: 'expand', type: 'boolean', default: true},
      versionsBack: {alias: 'n', type: 'number', default: 3},
      listVersions: {alias: 'lsv', type: 'boolean'},
      splitByVersion: {alias: 'split', type: 'boolean', default: true},
      'latest-changelog': {type: 'boolean', default: false},
    },
    async args => {
      if (args['latest-changelog']) {
        try {
          console.log(getLatestReleaseEntries({targetFolder: args.cwd}).join('\n'))
        } catch (error) {
          // no-op
        }
      } else await log(args)
    },
  )
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
          coerce: JSON.parse,
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
