import * as path from 'path'

export const config = {
  extends: '../../../../test/generic/config.mjs',
  env: {
    NO_SDK: true,
    SPEC_DRIVER: path.resolve('./test/utils/spec-driver.js'),
    SETUP_EYES: path.resolve('./test/utils/setup-eyes.js'),
  },
  filter: test => {
    if (test.api === 'classic') {
      return false
    }

    if (
      [
        // not possible because of browser api
        'should not fail if scroll root is stale',
        'should fail check of stale element',
        'should return test results from close with failed classic test', // no data classes
        'should return test results from close with passed classic test', // no data classes
        'should return test results from close with failed vg test', // no data classes
        'should return test results from close with passed vg test',
        'check region by selector in overflowed frame after manual scroll with css stitching', // no switchTo
        'check region by selector in overflowed frame after manual scroll with scroll stitching', // no switchTo
        'should waitBeforeCapture in check', // see comment in test/utils/setup-eyes.js --> openEyes

        // not possible because of core api
        'should not check if disabled', // isDisabled is a feature of @applitools/eyes

        // not possible due to onscreen mode
        'check window with layout breakpoints',
        'check window with layout breakpoints in config',
      ].indexOf(test.name) > -1
    ) {
      return false
    }

    return (
      (!test.env || (!test.env.device && !test.env.emulation && ['chrome', 'chromium'].includes(test.env.browser))) &&
      !test.features?.includes('image')
    )
  },
  overrides: [
    '../../../../../test/generic/overrides.mjs', // the global overrides.mjs file, not the JS one.
    test => {
      if (
        [
          // need to upgrade core in order to support
          'check window with reload layout breakpoints',
          'check window with reload layout breakpoints in config',
          'should abort after close with vg',
          'should abort unclosed tests',
          'should abort unclosed tests with vg',
          'should extract text from regions',
          'should send agentRunId',
          'should find regions by visual locator',
          'should find regions by visual locator with vg',
          'should return aborted tests in getAllTestResults',
          'should return aborted tests in getAllTestResults with vg',
          'should return browserInfo in getAllTestResults',
          'lazy load inside scrollRootElement',
          'lazy load page with default options',
          'lazy load page with all options specified',
          'lazy load page with one option specified scrollLength',
          'lazy load page with one option specified waitingTime',
          'lazy load page with one option specified maxAmountToScroll',

          'should send correct layout region if page has padded body with css stitching', // bug in old core

          // needs investigation
          'should extract text regions from image', // see here: https://github.com/applitools/eyes.sdk.javascript1/pull/1830#issuecomment-1669641099
          'should support removal of duplicate test results with ufg',
          'should support removal of duplicate test results with classic',
        ].indexOf(test.name) > -1
      ) {
        return {skip: true}
      }

      if (!test.vg) return {config: {branchName: 'onscreen'}}
    },
  ],
}
