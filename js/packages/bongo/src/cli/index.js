#!/usr/bin/env node

const yargs = require('yargs')
const chalk = require('chalk')
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
      }),
    async handler({tag, repo = 'https://github.com/applitools/eyes.sdk.javascript1'}) {
      const inquirer = await import('inquirer')
      if (!tag) {
        const releases = await getReleases({
          repo: 'https://github.com/applitools/eyes.sdk.javascript1',
          limit: 100,
        })
        const answers = await inquirer.default.prompt([
          {
            name: 'package',
            message: 'Package:',
            type: 'list',
            pageSize: 10,
            choices: Object.keys(releases),
          },
          {
            name: 'tag',
            message: 'Version:',
            type: 'list',
            pageSize: 10,
            choices: ({package}) => releases[package].map(({version, tag}) => ({name: version, value: tag})),
          },
        ])
        tag = answers.tag
      }
      const changelog = await extractSimplifiedChangelog({tag, repo})
      console.log(changelog)
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
