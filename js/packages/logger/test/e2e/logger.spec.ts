import assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import childProcess from 'child_process'
import * as utils from '@applitools/utils'
import {makeLogger} from '../../src'

describe('logger', () => {
  it('level silent', () => {
    const logger = makeLogger({handler: {type: 'console'}, level: 'silent', timestamp: false})
    const output = track(() => {
      logger.log('info')
      logger.warn('warn')
      logger.error('error')
      logger.fatal('fatal')
    })

    assert.deepStrictEqual(output.stdout, [])
    assert.deepStrictEqual(output.stderr, [])
  })

  it('level fatal', () => {
    const logger = makeLogger({handler: {type: 'console'}, level: 'fatal', timestamp: false})
    const output = track(() => {
      logger.log('info')
      logger.warn('warn')
      logger.error('error')
      logger.fatal('fatal')
    })

    assert.deepStrictEqual(output.stdout, [])
    assert.deepStrictEqual(output.stderr, ['[FATAL] fatal\n'])
  })

  it('level error', () => {
    const logger = makeLogger({handler: {type: 'console'}, level: 'error', timestamp: false})
    const output = track(() => {
      logger.log('info')
      logger.warn('warn')
      logger.error('error')
      logger.fatal('fatal')
    })

    assert.deepStrictEqual(output.stdout, [])
    assert.deepStrictEqual(output.stderr, ['[ERROR] error\n', '[FATAL] fatal\n'])
  })

  it('level warn', () => {
    const logger = makeLogger({handler: {type: 'console'}, level: 'warn', timestamp: false})
    const output = track(() => {
      logger.log('info')
      logger.warn('warn')
      logger.error('error')
      logger.fatal('fatal')
    })

    assert.deepStrictEqual(output.stdout, [])
    assert.deepStrictEqual(output.stderr, ['[WARN ] warn\n', '[ERROR] error\n', '[FATAL] fatal\n'])
  })

  it('level info', () => {
    const logger = makeLogger({handler: {type: 'console'}, level: 'info', timestamp: false})
    const output = track(() => {
      logger.log('info')
      logger.warn('warn')
      logger.error('error')
      logger.fatal('fatal')
    })

    assert.deepStrictEqual(output.stdout, ['[INFO ] info\n'])
    assert.deepStrictEqual(output.stderr, ['[WARN ] warn\n', '[ERROR] error\n', '[FATAL] fatal\n'])
  })

  it('label', () => {
    const logger = makeLogger({handler: {type: 'console'}, level: 'info', label: 'TEST', timestamp: false})
    const output = track(() => {
      logger.log('info')
    })

    assert.deepStrictEqual(output.stdout, ['TEST      | [INFO ] info\n'])
  })

  it('tags', () => {
    const logger = makeLogger({handler: {type: 'console'}, level: 'info', tags: {tag: '@@@'}, timestamp: false})
    const output = track(() => {
      logger.log('info')
    })

    assert.deepStrictEqual(output.stdout, ['[INFO ] {"tag":"@@@"} info\n'])
  })

  it('colors', () => {
    const timestamp = new Date('2021-03-19T16:49:00.000Z') as any
    const tags = {applitools: true}
    const logger = makeLogger({
      handler: {type: 'console'},
      label: 'Applitools',
      timestamp,
      tags: tags,
      level: 'info',
      colors: true,
    })
    const output = track(() => {
      logger.log('info')
      logger.warn('warn')
      logger.error('error')
      logger.fatal('fatal')
    })

    const prelude = `${chalk.cyan('Applitools')} ${chalk.greenBright(timestamp.toISOString())}`

    assert.deepStrictEqual(output.stdout, [
      `${prelude} ${chalk.bgBlueBright.black(' INFO  ')} ${chalk.blueBright(JSON.stringify(tags))} info\n`,
    ])
    assert.deepStrictEqual(output.stderr, [
      `${prelude} ${chalk.bgYellowBright.black(' WARN  ')} ${chalk.blueBright(JSON.stringify(tags))} warn\n`,
      `${prelude} ${chalk.bgRedBright.white(' ERROR ')} ${chalk.blueBright(JSON.stringify(tags))} error\n`,
      `${prelude} ${chalk.bgRed.white(' FATAL ')} ${chalk.blueBright(JSON.stringify(tags))} fatal\n`,
    ])
  })

  it('handler file', async () => {
    const filename = path.resolve(__dirname, './test.log')
    const logger = makeLogger({
      handler: {type: 'file', filename},
      level: 'info',
      tags: {tag: '&&&'},
      timestamp: new Date('2021-03-19T16:49:00.000Z') as any,
    })

    logger.log('info')
    logger.warn('warn')
    logger.error('error')
    logger.fatal('fatal')
    await utils.general.sleep(100)
    logger.close()

    const output = fs.readFileSync(filename, {encoding: 'utf8'})

    fs.unlinkSync(filename)

    assert.strictEqual(
      output,
      '2021-03-19T16:49:00.000Z [INFO ] {"tag":"&&&"} info\n' +
        '2021-03-19T16:49:00.000Z [WARN ] {"tag":"&&&"} warn\n' +
        '2021-03-19T16:49:00.000Z [ERROR] {"tag":"&&&"} error\n' +
        '2021-03-19T16:49:00.000Z [FATAL] {"tag":"&&&"} fatal\n',
    )
  })

  it('handler rolling file', async () => {
    const dirname = path.resolve(__dirname, 'test-logs')
    const logger = makeLogger({
      handler: {type: 'rolling file', dirname, name: 'test', maxFileLength: 100},
      level: 'info',
      tags: {tag: '&&&'},
      timestamp: new Date('2021-03-19T16:49:00.000Z') as any,
    })

    logger.log('info')
    await utils.general.sleep(10)
    logger.warn('warn')
    await utils.general.sleep(10)
    logger.error('error')
    await utils.general.sleep(10)
    logger.fatal('fatal')
    await utils.general.sleep(10)
    logger.close()

    const filenames = fs.readdirSync(dirname)

    const expected = [
      '2021-03-19T16:49:00.000Z [INFO ] {"tag":"&&&"} info\n',
      '2021-03-19T16:49:00.000Z [WARN ] {"tag":"&&&"} warn\n',
      '2021-03-19T16:49:00.000Z [ERROR] {"tag":"&&&"} error\n',
      '2021-03-19T16:49:00.000Z [FATAL] {"tag":"&&&"} fatal\n',
    ]

    filenames.forEach((filename, index) => {
      const output = fs.readFileSync(path.resolve(dirname, filename), {encoding: 'utf8'})
      assert.strictEqual(output, expected[index])
    })

    await fs.promises.rmdir(dirname, {recursive: true})
  })

  it('handler debug', async () => {
    // this is the test function that will be called by spawn to test the debug handler
    // must use spawn to check the e2e flow
    const child = childProcess.spawn(
      '../../node_modules/.bin/ts-node',
      [
        '-e',
        `(${function () {
          const {makeLogger} = require('../../src/logger')
          let logger = makeLogger({label: 'label WITH SpAcEs AND uppeR CAseS'})
          logger.log('log')
          logger.warn('warn')
          logger.error('error')
          logger.fatal('fatal')
          logger = logger.extend({label: 'label2', tags: {tag: '@@@'}})
          logger.log('log2')
          logger.warn('warn2')
          logger.error('error2')
          logger.fatal('fatal2')
          const consoleLogger = makeLogger({
            label: 'console',
            level: 'all',
            timestamp: false,
            handler: {type: 'console'},
          })
          consoleLogger.log('log')
        }})()`,
      ],
      {
        cwd: __dirname,
        stdio: [0, 'pipe', 'pipe', 'ipc'],
        env: {
          DEBUG: '*',
          DEBUG_HIDE_DATE: 'true',
          PATH: process.env.PATH,
        },
      },
    )
    let output = ''
    child.stderr.on('data', data => {
      output = `${output}${data}`
    })
    child.stdout.on('data', data => {
      output = `${output}${data}`
    })

    await new Promise(resolve => child.on('close', resolve))

    assert.strictEqual(
      output,
      [
        'appli:label-with-spaces-and-upper-cases [INFO ] log',
        'appli:label-with-spaces-and-upper-cases [WARN ] warn',
        'appli:label-with-spaces-and-upper-cases [ERROR] error',
        'appli:label-with-spaces-and-upper-cases [FATAL] fatal',
        'appli:label2 [INFO ] {"tag":"@@@"} log2',
        'appli:label2 [WARN ] {"tag":"@@@"} warn2',
        'appli:label2 [ERROR] {"tag":"@@@"} error2',
        'appli:label2 [FATAL] {"tag":"@@@"} fatal2',
        'console   | [INFO ] log',
        '',
      ].join('\n'),
    )
  })

  it('handler custom', () => {
    const output = []
    const handler = {log: message => output.push(message)}
    const logger = makeLogger({handler, level: 'info', timestamp: new Date('2021-03-19T16:49:00.000Z') as any})

    logger.log('info')
    logger.warn('warn')
    logger.error('error')
    logger.fatal('fatal')

    assert.deepStrictEqual(output, [
      '2021-03-19T16:49:00.000Z [INFO ] info',
      '2021-03-19T16:49:00.000Z [WARN ] warn',
      '2021-03-19T16:49:00.000Z [ERROR] error',
      '2021-03-19T16:49:00.000Z [FATAL] fatal',
    ])
  })

  it('format', () => {
    const output = []
    const format = (chunks, options) => ({chunks, ...options})
    const handler = {log: message => output.push(message)}
    const timestamp = new Date('2021-03-19T16:49:00.000Z') as any
    const label = 'Test'
    const logger = makeLogger({handler, format, level: 'info', label, timestamp})

    logger.log('info')
    logger.warn('warn')
    logger.error('error')
    logger.fatal('fatal')

    assert.deepStrictEqual(output, [
      {chunks: ['info'], label, level: 'info', tags: undefined, timestamp, colors: undefined},
      {chunks: ['warn'], label, level: 'warn', tags: undefined, timestamp, colors: undefined},
      {chunks: ['error'], label, level: 'error', tags: undefined, timestamp, colors: undefined},
      {chunks: ['fatal'], label, level: 'fatal', tags: undefined, timestamp, colors: undefined},
    ])
  })

  it('console', () => {
    const logger = makeLogger({level: 'silent'})
    const output = track(() => {
      logger.console.log('info')
      logger.console.warn('warn')
      logger.console.error('error')
      logger.console.fatal('fatal')
    })

    assert.deepStrictEqual(output.stdout, ['info\n'])
    assert.deepStrictEqual(output.stderr, ['warn\n', 'error\n', 'fatal\n'])
  })

  it('console custom', () => {
    const output = []
    const handler = {log: message => output.push(message)}
    const logger = makeLogger({handler, level: 'silent', console: false})
    const {stdout, stderr} = track(() => {
      logger.console.log('info')
      logger.console.warn('warn')
      logger.console.error('error')
      logger.console.fatal('fatal')
    })

    assert.deepStrictEqual(stdout, [])
    assert.deepStrictEqual(stderr, [])
    assert.deepStrictEqual(output, ['info', 'warn', 'error', 'fatal'])
  })

  function track(action) {
    const output = {stdout: [], stderr: []}
    const originalStdoutWrite = process.stdout.write.bind(process.stdout)
    const originalStderrWrite = process.stderr.write.bind(process.stderr)
    process.stdout.write = (chunk, ...rest: any[]) => (output.stdout.push(chunk), originalStdoutWrite(chunk, ...rest))
    process.stderr.write = (chunk, ...rest: any[]) => (output.stderr.push(chunk), originalStderrWrite(chunk, ...rest))
    action()
    process.stdout.write = originalStdoutWrite
    process.stderr.write = originalStderrWrite
    return output
  }
})
