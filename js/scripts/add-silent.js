#!/usr/bin/env node

const yargs = require('yargs')
const {execSync} = require('child_process')
const path = require('path')
const fs = require('fs')

yargs
  .command({
    command: '* <packages>',
    builder(yargs) {
      return yargs.options({
        packages: {
          describe: 'packages to install',
          type: 'string',
          demandOption: true,
          coerce: string => string.split(/[\s,]+/),
        },
        defaultVersion: {
          describe: 'version to install',
          type: 'string',
          default: process.env.APPLITOOLS_FRAMEWORK_VERSION,
        },
        cwd: {
          describe: 'package directory',
          type: 'string',
          default: process.env.INIT_CWD || process.cwd(),
        },
      })
    },
    async handler({cwd, packages, defaultVersion}) {
      try {
        const manifestPath = path.resolve(cwd, './package.json')
        const manifestContent = fs.readFileSync(manifestPath)
        const lockfilePath = path.resolve(process.cwd(), './yarn.lock')
        const lockfileContent = fs.readFileSync(lockfilePath)
        execSync(`yarn add -D ${packages.map(package => `${package}@${defaultVersion}`).join(' ')}`, {cwd})
        fs.writeFileSync(manifestPath, manifestContent)
        fs.writeFileSync(lockfilePath, lockfileContent)
      } catch (err) {
        if (err.stdout) err.stdout = err.stdout.toString()
        if (err.stderr) err.stderr = err.stderr.toString()
        throw err
      }
    },
  })
  .wrap(yargs.terminalWidth())
  .help().argv
