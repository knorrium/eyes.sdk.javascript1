export const config = {
  output: './test/generated-coverage/{{test-key}}.spec.js',
  tests: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/coverage-tests.js',
  emitter: './emitter.mjs',
  overrides: './overrides.mjs',
  template: './template.hbs',
  fixtures: '../../../test/fixtures',
  suites: {
    images: test => test.features?.includes('image'),
    local: test => !test.features?.includes('sauce'),
    sauce: test => test.features?.includes('sauce'),
  },
  meta: {output: './logs/meta.json'},
  format: {parser: 'babel', singleQuote: true, semi: false, bracketSpacing: false, trailingComma: 'es5'},
}
