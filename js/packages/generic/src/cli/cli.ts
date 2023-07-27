#!/usr/bin/env node

import type {GenericConfig} from '../types.js'
import yargs, {type CommandModule} from 'yargs'
import {hideBin} from 'yargs/helpers'
import {generate} from '../generate.js'

yargs(hideBin(process.argv))
  .command(<CommandModule<any, GenericConfig>>{
    command: '* [extends]',
    builder: {
      extends: {
        alias: ['config', 'c'],
        description: 'path to the sdk configuration file',
        type: 'string',
        default: './test/generic/index.js',
      },
      suite: {
        alias: ['s'],
        description: 'suite name to generate',
        type: 'string',
      },
      tests: {
        alias: ['t'],
        description: 'path to the tests file (local or remote)',
        type: 'string',
      },
      template: {
        description: 'path to the template .hbs file (local or remote)',
        type: 'string',
      },
      emitter: {
        alias: ['e'],
        description: 'path to the spec emitter definition file (local or remote)',
        type: 'string',
      },
      overrides: {
        description: 'path to the tests overrides file (local or remote)',
        type: 'string',
      },
      fixtures: {
        description: 'path to the fixtures (local or remote)',
        type: 'string',
      },
      output: {
        alias: ['o', 'out', 'outPath'],
        description: 'path to save generated files',
        type: 'string',
      },
      strict: {
        description: 'whether to throw an error if test emitting is failed',
        type: 'boolean',
        default: false,
      },
    },
    handler: generate,
  })
  .demandCommand(1, 'You need to specify a command before moving on')
  .wrap(null).argv
