import * as path from 'path'

export const config = {
  extends: '../../../../test/generic/config.mjs',
  template: './template.hbs',
  env: {
    NO_BUILD_DRIVER: true,
    SDK: path.resolve('./dist/index.js'),
  },
  filter: test => {
    return (
      (!test.env || (!test.env.device && !test.env.emulation && ['chrome', 'chromium'].includes(test.env.browser))) &&
      !test.features?.includes('webdriver') &&
      test.vg
    )
  },
  overrides: [
    '../../../../test/generic/overrides.mjs',
    {
      'check window with default fully with vg classic': {config: {branchName: 'testcafe-sdk'}},
      'check region by element within shadow dom with vg': {
        skipEmit: true,
        reason: "testcafe doesn't allow to look for element within another  element out of the box",
      },
    },
  ],
}
