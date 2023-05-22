#!/usr/bin/env node
/* eslint no-console: off */
import {makeCoreServer} from '../universal/core-server'
import {makeCoreServerProcess} from '../universal/core-server-process'
import {parseLogs, structureLogs} from '../troubleshoot/logs'
import yargs from 'yargs'
import * as utils from '@applitools/utils'

yargs
  .example([
    ['eyes universal', 'Run Eyes Universal server on default port (21077)'],
    ['eyes universal --fork', 'Run Eyes Universal server in a forked process'],
    ['eyes universal --port 8080', 'Run Eyes Universal server on port 8080'],
    ['eyes universal --no-singleton', 'Run Eyes Universal server on a non-singleton mode'],
    ['eyes universal --shutdown-mode stdin', 'Run Eyes Universal server which will close once stdin stream will end'],
    ['eyes check-network', ''],
  ])
  .command({
    command: 'universal',
    builder: yargs =>
      yargs.options({
        port: {
          description: 'run server on a specific port.',
          type: 'number',
          default: 21077,
        },
        singleton: {
          description:
            'runs server on a singleton mode. It will prevent the server to start in case the same server is already started.',
          type: 'boolean',
          default: true,
        },
        fork: {
          description: 'runs server in a forked process.',
          type: 'boolean',
          default: false,
        },
        debug: {
          description: 'runs server in a debug mode.',
          type: 'boolean',
          default: false,
        },
        'port-resolution-mode': {
          describe:
            'preferred algorithm to solve port collisions.\n"lazy" mode will not try find free port.\n"random" mode will run on a random port.\n"next" mode will run on next free port after the given one.',
          alias: 'port-resolution',
          type: 'string',
          default: 'next',
        },
        'shutdown-mode': {
          describe:
            'preferred algorithm to automatically kill the process.\n"lazy" mode will end the process once the idle timeout ran out after the last client is disconnected from the server.\n"stdin" mode will end the process once its stdin stream got to its end.',
          alias: 'shutdown',
          type: 'string',
          default: 'lazy',
        },
        'idle-timeout': {
          description: 'time in minutes for server to stay responsible in case of idle.',
          type: 'number',
          default: 15,
          coerce: value => value * 60 * 1000,
        },
        cert: {
          description: 'path to the certificate file.',
          alias: 'cert-path',
          type: 'string',
          implies: 'key',
        },
        key: {
          description: 'path to the key file.',
          alias: 'key-path',
          type: 'string',
          implies: 'cert',
        },
        config: {
          description: 'json string to use instead of cli arguments',
          type: 'string',
          coerce: JSON.parse,
        },
      }),
    handler: async (args: any) => {
      if (args.fork) {
        const {port} = await makeCoreServerProcess({...args, fork: false, isProcess: true})
        // eslint-disable-next-line no-console
        console.log(port) // NOTE: this is a part of the generic protocol
      } else {
        makeCoreServer({...args, ...args.config, isProcess: true})
      }
    },
  })
  .command({
    command: 'logs [input]',
    builder: yargs =>
      yargs.options({
        input: {
          description: 'log input to process',
          type: 'string',
        },
        structure: {
          description: 'group logs by tag names',
          type: 'boolean',
        },
      }),
    handler: async (args: any) => {
      const input = args.input ?? (await utils.streams.toBuffer(process.stdin)).toString('utf8')
      const logs = parseLogs(input)
      if (args.structure) {
        console.log(JSON.stringify(structureLogs(logs), null, 2))
      } else {
        console.log(JSON.stringify(logs, null, 2))
      }
    },
  })
  .wrap(yargs.terminalWidth()).argv
