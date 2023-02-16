import assert from 'assert'
import {EventEmitter} from 'events'
import {makeSocket} from '../src/socket'
import {makeTransport} from '../src/transports/ee'

describe('socket', () => {
  it('responds with return value', async () => {
    const ee = new EventEmitter()
    const server = makeSocket(ee, {
      transport: makeTransport({events: {message: 'incoming-message', emit: 'outgoing-message'}}),
    })
    const client = makeSocket(ee, {
      transport: makeTransport({events: {message: 'outgoing-message', emit: 'incoming-message'}}),
    })

    server.command('getData', () => {
      return {data: true}
    })
    const data = await client.request('getData', {data: true})

    assert.deepStrictEqual(data, {data: true})
  })

  it('responds with serialized error', async () => {
    const ee = new EventEmitter()
    const server = makeSocket(ee, {
      transport: makeTransport({events: {message: 'incoming-message', emit: 'outgoing-message'}}),
    })
    const client = makeSocket(ee, {
      transport: makeTransport({events: {message: 'outgoing-message', emit: 'incoming-message'}}),
    })
    server.command('throwError', () => {
      const error = new Error('Serializable error with additional data') as Error & {toJSON(): Record<string, any>}
      error.toJSON = () => ({reason: 'custom', info: {additional: 'data'}})
      throw error
    })

    await assert.rejects(client.request('throwError'), error => {
      return error.reason === 'custom' && error.info.additional === 'data'
    })
  })

  it('responds with internal error', async () => {
    const ee = new EventEmitter()
    const server = makeSocket(ee, {
      transport: makeTransport({events: {message: 'incoming-message', emit: 'outgoing-message'}}),
    })
    const client = makeSocket(ee, {
      transport: makeTransport({events: {message: 'outgoing-message', emit: 'incoming-message'}}),
    })
    server.command('throwError', () => {
      throw new Error('Internal error message')
    })

    await assert.rejects(client.request('throwError'), error => error.reason === 'internal')
  })
})
