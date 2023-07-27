export const config = {
  extends: '../../../../test/generic/config.mjs',
  overrides: [
    '../../../../test/generic/overrides.mjs',
    {
      'check region by selector on ie': {skipEmit: true, reason: 'irrelevant'},
      'should send dom on ie': {skipEmit: true, reason: 'irrelevant'},
      'check region by selector in frame fully on firefox legacy': {skipEmit: true, reason: 'irrelevant'},
      'appium android check region': {skipEmit: true, reason: 'irrelevant'},
      'appium android check region with ignore region': {skipEmit: true, reason: 'irrelevant'},
      'appium android check window': {skipEmit: true, reason: 'irrelevant'},
      'appium android landscape mode check region on android 7': {skipEmit: true, reason: 'irrelevant'},
      'appium android landscape mode check region on android 10': {skipEmit: true, reason: 'irrelevant'},
      'appium android landscape mode check window on android 7': {skipEmit: true, reason: 'irrelevant'},
      'appium android landscape mode check window on android 10': {skipEmit: true, reason: 'irrelevant'},
      'appium iOS check fully window with scroll and pageCoverage': {skipEmit: true, reason: 'irrelevant'},
      'appium iOS check region': {skipEmit: true, reason: 'irrelevant'},
      'appium iOS check region with ignore region': {skipEmit: true, reason: 'irrelevant'},
      'appium iOS check window': {skipEmit: true, reason: 'irrelevant'},
      'appium iOS check window region with scroll and pageCoverage': {skipEmit: true, reason: 'irrelevant'},
      'appium iOS nav bar check region': {skipEmit: true, reason: 'irrelevant'},
    },
  ],
}
