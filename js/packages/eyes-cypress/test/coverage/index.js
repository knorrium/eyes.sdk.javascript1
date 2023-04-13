module.exports = {
  name: 'eyes-cypress',
  ext: '.spec.js',
  emitter: './test/coverage/emitter.js',
  template: './test/coverage/template.hbs',
  output: './test/coverage/generic/cypress/e2e/generic',
  tests: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/coverage-tests.js',
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js',
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/js-overrides.js',
    ...(process.env.APPLITOOLS_TEST_REMOTE === 'eg'
      ? ['https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/eg.overrides.js']
      : []),
    './test/coverage/overrides.js',
  ],
  emitOnly: test => {
    if (
      test.api === 'classic' ||
      (test.name.toLowerCase().includes('shadow') && test.name.toLowerCase().includes('dom')) ||
      // skipping this test as we get CypressError: `cy.visit()` failed trying to load on CI
      test.name.toLowerCase() === 'should send ufg options'
    )
      return false
    return test.vg
  },
}
