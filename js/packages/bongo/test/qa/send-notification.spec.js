const {sendReleaseNotification} = require('../../src/qa/send-notification')
const nock = require('nock')
const path = require('path')
const assert = require('assert')

describe('send notification', () => {
  it('release notification for SDK', async () => {
    nock('http://applitools-quality-server.herokuapp.com')
      .matchHeader('Content-Type', 'application/json')
      .post('/send_mail/sdks')
      .reply((_url, body) => {
        assert.deepStrictEqual(body, {
          sdk: 'blah',
          version: '4.58.4',
          changeLog:
            '### features\n' +
            '- support ufg for native mobile\n' +
            '- `runner.getalltestresults` returns the corresponding ufg browser/device configuration for each test. this is available as `runner.getalltestresults()[i].browserinfo`.\n' +
            '### bug fixes\n' +
            "- `extracttext` now supports regions that don't use hints while using `x`/`y` coordinates\n" +
            '- accept ios and android lowercase as driver platformname capability when using custom grid\n' +
            '- when running on a native ios app, allow capturing navigationbar and tabbar regions\n' +
            '- when running a native app on android, in case we test a device in landscape mode, make sure to account for the navigation bar on the left or right and not at the bottom of the image. also account for an appium bug when calculating system bars height.\n' +
            '- support data urls in iframes',
          testCoverageGap: 'TODO',
        })
        return [200]
      })
    await sendReleaseNotification({
      name: 'blah',
      releaseVersion: '4.58.4',
      changelogPath: path.resolve(__dirname, '../fixtures'),
    })
  })

  it('release notification for core', async () => {
    nock('http://applitools-quality-server.herokuapp.com')
      .post('/send_mail/core_sdk')
      .matchHeader('Content-Type', 'application/json')
      .reply((_uri, body) => {
        assert.deepStrictEqual(body, {
          sdk: 'core',
          version: '4.58.4',
          changeLog:
            '### features\n' +
            '- support ufg for native mobile\n' +
            '- `runner.getalltestresults` returns the corresponding ufg browser/device configuration for each test. this is available as `runner.getalltestresults()[i].browserinfo`.\n' +
            '### bug fixes\n' +
            "- `extracttext` now supports regions that don't use hints while using `x`/`y` coordinates\n" +
            '- accept ios and android lowercase as driver platformname capability when using custom grid\n' +
            '- when running on a native ios app, allow capturing navigationbar and tabbar regions\n' +
            '- when running a native app on android, in case we test a device in landscape mode, make sure to account for the navigation bar on the left or right and not at the bottom of the image. also account for an appium bug when calculating system bars height.\n' +
            '- support data urls in iframes',
          testCoverageGap: 'TODO',
        })
        return [200]
      })

    await sendReleaseNotification({
      name: 'core',
      releaseVersion: '4.58.4',
      changelogPath: path.resolve(__dirname, '../fixtures'),
    })
  })
})
