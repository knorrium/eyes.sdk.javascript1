module.exports = {
    name: 'eyes_images_dotnet',
    emitter: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/DotNet/emitter.js',
    overrides: [
        'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js',
        'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/DotNet/overrides/overrides-images.js',
    ],
    template: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/DotNet/template.hbs',
    tests: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/coverage-tests.js',
    ext: '.cs',
    outPath: './test/Images/coverage/generic',
    fixtures: "https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/fixtures/fixtures.zip",
    emitOnly: test => {
        return test.features && test.features.includes('image')
      },
};