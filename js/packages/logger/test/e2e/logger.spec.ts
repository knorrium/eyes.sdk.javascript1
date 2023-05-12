import {makeLogger, mergeLoggers} from '../../src'
import assert from 'assert'
import chalk from 'chalk'
import debug from 'debug'
import * as fs from 'fs'
import * as path from 'path'
import * as utils from '@applitools/utils'

describe('logger', () => {
  it('level silent', () => {
    const logger = makeLogger({handler: {type: 'console'}, level: 'silent', format: {timestamp: false}})
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
    const logger = makeLogger({handler: {type: 'console'}, level: 'fatal', format: {timestamp: false}})
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
    const logger = makeLogger({handler: {type: 'console'}, level: 'error', format: {timestamp: false}})
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
    const logger = makeLogger({handler: {type: 'console'}, level: 'warn', format: {timestamp: false}})
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
    const logger = makeLogger({handler: {type: 'console'}, level: 'info', format: {timestamp: false}})
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
    const logger = makeLogger({handler: {type: 'console'}, level: 'info', format: {label: 'TEST', timestamp: false}})
    const output = track(() => {
      logger.log('info')
    })

    assert.deepStrictEqual(output.stdout, ['TEST | [INFO ] info\n'])
  })

  it('tags', () => {
    const logger1 = makeLogger({
      handler: {type: 'console'},
      level: 'info',
      format: {tags: ['@@@', '%%%'], timestamp: false},
    })
    const logger2 = makeLogger({
      handler: {type: 'console'},
      level: 'info',
      format: {tags: [['@@@', '%%%'], ['$$$']], timestamp: false},
    })
    const output = track(() => {
      logger1.log('info')
      logger2.log('info')
    })

    assert.deepStrictEqual(output.stdout, ['(@@@/%%%) | [INFO ] info\n', '(@@@/%%% & $$$) | [INFO ] info\n'])
  })

  it('colors', () => {
    const timestamp = new Date('2021-03-19T16:49:00.000Z') as any
    const logger = makeLogger({
      handler: {type: 'console'},
      level: 'info',
      format: {
        label: 'Applitools',
        tags: ['tag'],
        timestamp,
        colors: true,
      },
    })
    const output = track(() => {
      logger.log('info')
      logger.warn('warn')
      logger.error('error')
      logger.fatal('fatal')
    })

    const prelude = `${chalk.cyan('Applitools')} ${chalk.blueBright('(tag)')} ${chalk.greenBright(
      timestamp.toISOString(),
    )}`

    assert.deepStrictEqual(output.stdout, [`${prelude} ${chalk.bgBlueBright.black(' INFO  ')} info\n`])
    assert.deepStrictEqual(output.stderr, [
      `${prelude} ${chalk.bgYellowBright.black(' WARN  ')} warn\n`,
      `${prelude} ${chalk.bgRedBright.white(' ERROR ')} error\n`,
      `${prelude} ${chalk.bgRed.white(' FATAL ')} fatal\n`,
    ])
  })

  it('handler file', async () => {
    const filename = path.resolve(__dirname, './test.log')
    const logger = makeLogger({
      handler: {type: 'file', filename},
      level: 'info',
      format: {
        tags: ['&&&'],
        timestamp: new Date('2021-03-19T16:49:00.000Z'),
      },
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
      '(&&&) | 2021-03-19T16:49:00.000Z [INFO ] info\n' +
        '(&&&) | 2021-03-19T16:49:00.000Z [WARN ] warn\n' +
        '(&&&) | 2021-03-19T16:49:00.000Z [ERROR] error\n' +
        '(&&&) | 2021-03-19T16:49:00.000Z [FATAL] fatal\n',
    )
  })

  it('handler rolling file', async () => {
    const dirname = path.resolve(__dirname, 'test-logs')
    const logger = makeLogger({
      handler: {type: 'rolling file', dirname, name: 'test', maxFileLength: 80},
      level: 'info',
      format: {
        tags: ['&&&'],
        timestamp: new Date('2021-03-19T16:49:00.000Z'),
      },
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
      '(&&&) | 2021-03-19T16:49:00.000Z [INFO ] info\n',
      '(&&&) | 2021-03-19T16:49:00.000Z [WARN ] warn\n',
      '(&&&) | 2021-03-19T16:49:00.000Z [ERROR] error\n',
      '(&&&) | 2021-03-19T16:49:00.000Z [FATAL] fatal\n',
    ]

    filenames.forEach((filename, index) => {
      const output = fs.readFileSync(path.resolve(dirname, filename), {encoding: 'utf8'})
      assert.strictEqual(output, expected[index])
    })

    await fs.promises.rmdir(dirname, {recursive: true})
  })

  it('handler debug', async () => {
    process.env.DEBUG = 'appli:*'
    debug.enable(process.env.DEBUG)
    Object.assign((debug as any).inspectOpts, {colors: false, hideDate: true})

    const logger = makeLogger({format: {label: 'label WITH SpAcEs AND uppeR CAseS', colors: false, timestamp: false}})
    const loggerExtended = logger.extend({label: 'label2', tags: ['@@@']})
    const output = track(() => {
      logger.log('log')
      logger.warn('warn')
      logger.error('error')
      logger.fatal('fatal')
      loggerExtended.log('log2')
      loggerExtended.warn('warn2')
      loggerExtended.error('error2')
      loggerExtended.fatal('fatal2')
    })

    assert.deepStrictEqual(output.stderr, [
      'appli:label-with-spaces-and-upper-cases [INFO ] log\n',
      'appli:label-with-spaces-and-upper-cases [WARN ] warn\n',
      'appli:label-with-spaces-and-upper-cases [ERROR] error\n',
      'appli:label-with-spaces-and-upper-cases [FATAL] fatal\n',
      'appli:label2 (@@@) | [INFO ] log2\n',
      'appli:label2 (@@@) | [WARN ] warn2\n',
      'appli:label2 (@@@) | [ERROR] error2\n',
      'appli:label2 (@@@) | [FATAL] fatal2\n',
    ])
  })

  it('handler custom', () => {
    const output = [] as string[]
    const handler = {log: (message: string) => output.push(message)}
    const logger = makeLogger({handler, level: 'info', format: {timestamp: new Date('2021-03-19T16:49:00.000Z')}})

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

  it('formatter', () => {
    const output = [] as string[]
    const formatter = (chunks: any[], options?: Record<string, any>) => ({chunks, ...options} as any)
    const handler = {log: (message: string) => output.push(message)}
    const timestamp = new Date('2021-03-19T16:49:00.000Z')
    const label = 'Test'
    const logger = makeLogger({handler, level: 'info', format: {formatter, label, timestamp}})

    logger.log('info')
    logger.warn('warn')
    logger.error('error')
    logger.fatal('fatal')

    assert.deepStrictEqual(output, [
      {chunks: ['info'], formatter, label, level: 'info', timestamp, colors: undefined},
      {chunks: ['warn'], formatter, label, level: 'warn', timestamp, colors: undefined},
      {chunks: ['error'], formatter, label, level: 'error', timestamp, colors: undefined},
      {chunks: ['fatal'], formatter, label, level: 'fatal', timestamp, colors: undefined},
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
    const output = [] as any[]
    const handler = {log: (message: string) => output.push(message)}
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

  it('merged logger', () => {
    const logger1 = makeLogger({
      handler: {type: 'console'},
      level: 'info',
      format: {tags: ['a', 'b', 'c'], timestamp: false},
    })
    const logger2 = makeLogger({
      handler: {type: 'console'},
      level: 'info',
      format: {tags: ['d', 'e', 'f'], timestamp: false},
    })
    const logger = mergeLoggers(logger1, logger2)
    const output = track(() => {
      logger.log('info')
    })

    assert.deepStrictEqual(output.stdout, ['(a/b/c & d/e/f) | [INFO ] info\n'])
  })

  function track(action: () => void) {
    const output = {stdout: [] as string[], stderr: [] as string[]}
    const originalStdoutWrite = process.stdout.write.bind(process.stdout)
    const originalStderrWrite = process.stderr.write.bind(process.stderr)
    process.stdout.write = (chunk, ...rest: any[]) => (
      output.stdout.push(chunk as string), originalStdoutWrite(chunk, ...rest)
    )
    process.stderr.write = (chunk, ...rest: any[]) => (
      output.stderr.push(chunk as string), originalStderrWrite(chunk, ...rest)
    )
    action()
    process.stdout.write = originalStdoutWrite
    process.stderr.write = originalStderrWrite
    return output
  }
})
