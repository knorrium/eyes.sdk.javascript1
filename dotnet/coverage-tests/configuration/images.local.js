module.exports = {
  name: "eyes_images_dotnet",
  emitter: "/home/itaibh/devel/sdk.coverage.tests/DotNet/emitter.js",
  overrides: [
    "https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js",
  ],
  template: "/home/itaibh/devel/sdk.coverage.tests/DotNet/template.hbs",
  tests: "/home/itaibh/devel/sdk.coverage.tests/coverage-tests.js",
  ext: ".cs",
  outPath: './test/Images/coverage/generic',
  // emitOnly: test => {
  //   return test.features && test.features.includes('image')
  // },
  emitOnly: ['check image file in png format'],
};