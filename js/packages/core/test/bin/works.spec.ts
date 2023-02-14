import {spawn, type ChildProcess} from 'child_process'
import {existsSync} from 'fs'

describe('bin works', () => {
  let bin: string
  if (process.platform === 'darwin') {
    bin = './bin/core-macos'
  } else if (process.platform === 'win32') {
    bin = './bin/core-win'
  } else if (process.platform === 'linux') {
    if (process.arch === 'arm64') {
      bin = './bin/core-linux-arm64'
    } else {
      bin = `./bin/core-${existsSync('/etc/alpine-release') ? 'alpine' : 'linux'}`
    }
  } else {
    throw new Error('Unknown platform')
  }
  /* eslint-disable-next-line no-console */
  console.log(bin)
  let server: ChildProcess
  afterEach(() => {
    server?.kill()
  })

  it('communicates universal ws port via stdout', async () => {
    server = spawn(process.platform === 'win32' ? bin : `chmod +x ${bin} && ${bin} universal --shutdown stdin`, {
      detached: true,
      shell: process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/sh',
      stdio: ['ignore', 'pipe', 'inherit'],
    })
    return new Promise<void>((resolve, reject) => {
      server.on('error', reject)

      const timeout = setTimeout(() => reject(new Error('No output from the server for 20 seconds')), 20000)
      server.stdout?.once('data', data => {
        clearTimeout(timeout)
        const [firstLine] = String(data).split('\n', 1)
        if (Number.isInteger(Number(firstLine))) {
          resolve()
        } else {
          reject(new Error(`Server first line of stdout output expected to be a port, but got "${firstLine}"`))
        }
      })
    })
  })

  it('shuts universal with stdin', async () => {
    server = spawn(process.platform === 'win32' ? bin : `chmod +x ${bin} && ${bin} universal --shutdown stdin`, {
      detached: true,
      shell: process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/sh',
      stdio: ['pipe', 'inherit', 'inherit'],
    })

    let timeout
    await new Promise<void>((resolve, reject) => {
      server.on('error', reject)

      timeout = setTimeout(() => reject(new Error('No output from the server for 20 seconds')), 20000)
      server.on('exit', resolve)
      server.on('close', resolve)

      server.stdin?.end()
    })
    clearTimeout(timeout)
  })
})
