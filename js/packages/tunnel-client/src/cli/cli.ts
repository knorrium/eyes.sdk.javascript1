#!/usr/bin/env node

import type {TunnelClientWorkerSettings} from '../types'
import {makeTunnelClientWorker} from '../worker'
import yargs, {type CommandModule} from 'yargs'

yargs
  .command(<CommandModule<any, TunnelClientWorkerSettings>>{
    command: '*',
    builder: {
      serviceUrl: {
        description: 'specific tunnel service url.',
        type: 'number',
      },
      pollingServerUrl: {
        alias: ['baseUrl'],
        description: 'polling server url.',
        type: 'string',
        require: true,
      },
      secret: {
        description: 'auth secret for polling server.',
        type: 'string',
        require: true,
      },
      agentId: {
        description: 'agent name.',
        type: 'string',
        require: true,
      },
    },
    handler(settings) {
      makeTunnelClientWorker({settings})
    },
  })
  .wrap(yargs.terminalWidth()).argv
