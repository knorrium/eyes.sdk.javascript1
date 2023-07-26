export const config = {
  extends: '../../../../test/generic/config.mjs',
  env: {
    NO_DRIVER: true,
  },
  overrides: [
    '../../../../test/generic/overrides.mjs',
    '../../../../../test/generic/overrides.mjs',
    test => {
      if (!test.features?.includes('image')) return {skipEmit: true}
      return test
    },
  ],
}
