module.exports = {
  name: 'eyes_selenium_ruby',
  emitter: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/ruby/initialize.js',
  overrides: [
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js',
    'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/ruby/overrides.js',
  ],
  emitOnly: test => {
    let env = test.env || {}
    let features = test.features || []
    return !("device" in env) &&
      !features.includes("image") &&
      !features.includes("cached-selectors");
  },
  template: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/ruby/template.hbs',
  tests: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/coverage-tests.js',
  ext: '_spec.rb',
  outPath: './spec/coverage/generic'
};
