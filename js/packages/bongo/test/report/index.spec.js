const nock = require('nock')
const {fixtureDir} = require('./util')
const {sendTestReport, sendReleaseNotification} = require('../../src/report')

describe('report', () => {
  describe('send', () => {
    const serverUrl = 'http://applitools-quality-server.herokuapp.com'

    afterEach(() => {
      nock.cleanAll()
    })

    it('test report', async () => {
      nock(serverUrl)
        .post('/result')
        .reply((_url, body) => {
          console.log(JSON.stringify(body, null, 2))
          return [200]
        })
      await sendTestReport({resultPath: fixtureDir, skipStorage: true})
    })
    it('release notification for SDK', async () => {
      nock(serverUrl)
        .post('/send_mail/sdks')
        .reply((_url, body) => {
          console.log(JSON.stringify(body, null, 2))
          return [200]
        })
      await sendReleaseNotification({name: 'blah', version: '4.58.4', targetFolder: fixtureDir})
    })
    it('release notification for core', async () => {
      nock(serverUrl)
        .post('/send_mail/core_sdk')
        .reply((_url, body) => {
          console.log(JSON.stringify(body, null, 2))
          return [200]
        })
      await sendReleaseNotification({name: 'core', version: '4.58.4', targetFolder: fixtureDir})
    })
  })
})
