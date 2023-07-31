export const config = {
  extends: '../../../../test/generic/config.mjs',
  suite: test => {
    return (!test.env || !test.env.device) && !test.features?.includes('jsonwire')
  },
}
