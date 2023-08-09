export const config = {
  extends: '../../../../test/generic/config.mjs',
  filter: test => {
    return (!test.env || !test.env.device) && !test.features?.includes('jsonwire')
  },
}
