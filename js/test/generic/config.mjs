export const config = {
  output: './test/generated-coverage/{{test-key}}.spec.js',
  tests: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/coverage-tests.js',
  emitter: './emitter.mjs',
  overrides: ['../../../test/generic/overrides.mjs', './overrides.mjs'],
  template: './template.hbs',
  fixtures: '../../../test/fixtures',
  meta: {output: './logs/meta.json'},
  format: {
    parser: 'babel',
    singleQuote: true,
    semi: false,
    bracketSpacing: false,
    trailingComma: 'es5',
  },
}
