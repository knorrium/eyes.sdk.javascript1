export const config = {
  extends: '../../../../test/generic/config.mjs',
  output: './test/generic/cypress/e2e/generated/{{test-key}}.spec.js',
  emitter: './emitter.mjs',
  template: './template.hbs',
  overrides: [
    '../../../../test/generic/overrides.mjs',
    {'check window with default fully with vg': {config: {branchName: 'universal-sdk'}}},
    test => {
      if (
        test.api === 'classic' ||
        (test.name.toLowerCase().includes('shadow') && test.name.toLowerCase().includes('dom'))
      )
        return {skipEmit: true}
      return {skipEmit: !test.vg}
    },
  ],
}
