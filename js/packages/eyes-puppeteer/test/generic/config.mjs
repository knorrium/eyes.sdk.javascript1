export const config = {
  extends: '../../../../test/generic/config.mjs',
  filter: test => {
    return (
      (!test.env || (!test.env.device && !test.env.emulation && ['chrome', 'chromium'].includes(test.env.browser))) &&
      !test.features?.includes('webdriver')
    )
  },
}
