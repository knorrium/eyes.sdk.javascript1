import {type Options} from './core-server'
import {fork, type ForkOptions} from 'child_process'
import path from 'path'

export function makeCoreServerProcess(
  options: Options & {forkOptions?: ForkOptions},
): Promise<{port: number; close: () => void}> {
  return new Promise((resolve, reject) => {
    const server = fork(path.resolve(__dirname, '../../dist/cli.js'), [`--config=${JSON.stringify(options)}`], {
      stdio: [options.shutdownMode === 'stdin' ? 'inherit' : 'ignore', 'ignore', 'ignore', 'ipc'],
      ...options.forkOptions,
    })

    const timeout = setTimeout(() => {
      reject(new Error(`Server didn't respond for 10s after being started`))
      server.kill()
    }, 60000)

    server.on('error', reject)

    server.once('message', ({name, payload}: {name: string; payload: {port: number}}) => {
      if (name === 'port') {
        resolve({port: payload.port, close: () => server.kill()})
        clearTimeout(timeout)
        server.channel?.unref()
      }
    })

    server.unref()
  })
}
