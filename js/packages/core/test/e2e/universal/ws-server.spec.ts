import WebSocket from 'ws'
import {generateCertificate} from '@applitools/test-server'
import {makeServer} from '../../../src/universal/ws-server'
import assert from 'assert'

describe('universal ws server', () => {
  it('starts server in secure mode', async () => {
    const authority = await generateCertificate({days: 1})
    const {port, server} = await makeServer({...authority})
    const ws = new WebSocket(`wss://localhost:${port}/eyes`, {rejectUnauthorized: false})

    try {
      await new Promise((resolve, reject) => {
        ws.on('open', resolve)
        ws.on('close', reject)
        ws.on('error', reject)
      })
    } finally {
      ws.close()
      server?.close()
    }
  })

  it('accepts payload of 256mb', async () => {
    const {port, server} = await makeServer()
    server!.on('connection', client => client.on('message', data => client.send(data)))
    const ws = new WebSocket(`ws://localhost:${port}/eyes`, {maxPayload: 256 * 1024 * 1024})

    try {
      await new Promise<void>((resolve, reject) => {
        ws.on('open', () => {
          const input = Buffer.alloc(256 * 1024 * 1024).fill(107)
          ws.send(input)
          ws.on('message', output => {
            resolve(Promise.resolve().then(() => assert.strictEqual(Buffer.compare(input, Buffer.from(output)), 0)))
          })
        })
        ws.on('close', reject)
        ws.on('error', reject)
      })
    } finally {
      ws.close()
      server?.close()
    }
  })
})
