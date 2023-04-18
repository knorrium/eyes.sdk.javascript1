import type {ECClient} from '../../src/types'
import {Builder} from 'selenium-webdriver'
import {makeTestServer} from '@applitools/test-server'
import {makeECClient} from '../../src/client'
import assert from 'assert'

describe('with tunnel', () => {
  let client: ECClient, server: any, url: string

  before(async () => {
    server = await makeTestServer()
    url = `http://localhost:${server.port}/page/index.html`
  })

  after(async () => {
    await server?.close()
  })

  afterEach(async () => {
    await client?.close()
  })

  it('works with tunnel', async () => {
    client = await makeECClient()
    const driver = await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(client.url)
      .build()

    await driver.get(url)
    const title = await driver.executeScript('return document.title')

    await driver.quit()

    assert.strictEqual(title, 'My local page')
  })

  it('works with tunnel in parallel processes', async () => {
    client = await makeECClient()
    await Promise.all(
      Array.from({length: 5}, async () => {
        const driver = await new Builder()
          .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
          .usingServer(client.url)
          .build()

        await driver.get(url)
        const title = await driver.executeScript('return document.title')

        await driver.quit()

        assert.strictEqual(title, 'My local page')
      }),
    )
  })

  // TODO: add assertion for expected error
  it.skip('fails gracefully when tunnel closes during test run', async () => {
    client = await makeECClient()
    let driver = await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(client.url)
      .build()
    await driver.get('https://applitools.com')
    await driver.quit()
    driver = await new Builder()
      .withCapabilities({browserName: 'chrome', 'applitools:tunnel': true})
      .usingServer(client.url)
      .build()
    await driver.get('https://applitools.com')
    await driver.quit()
  })
})
