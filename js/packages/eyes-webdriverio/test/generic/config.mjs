export const config = {
  extends: '../../../../test/generic/config.mjs',
  filter: test => {
    if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp') {
      return (!test.env || ['chrome', 'chromium'].includes(test.env.browser)) && !test.features?.includes('shadow-dom')
    }
    return true
  },
  overrides: [
    '../../../../test/generic/overrides.mjs',
    test => {
      if (process.env.APPLITOOLS_WEBDRIVERIO_PROTOCOL === 'cdp' && test.env?.emulation) {
        return {skip: true, reason: `failed to run proper emulation with puppeteer`}
      }
    },
  ],
}
