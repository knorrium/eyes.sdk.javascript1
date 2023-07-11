module.exports = {
  name: "eyes_selenium_java",
  emitter: "https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/java/emitter.js",
  overrides: [
    "https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js",
    "https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/java/overrides/overrides-selenium.js"
  ],
  template: "https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/java/template.hbs",
  tests: "https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/coverage-tests.js",
  ext: ".java",
  outPath: "./src/test/java/coverage/generic",
  fixtures: "https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/fixtures/fixtures.zip",
  emitOnly: test => {
      return test.env && test.env.app
  }
};