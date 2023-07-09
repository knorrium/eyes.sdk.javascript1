module.exports = {
    name: 'eyes_selenium_dotnet',
    emitter: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/DotNet/emitter.js',
    overrides: [
        'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/js/overrides.js',
    ],
    template: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/master/DotNet/template.hbs',
    tests: 'https://raw.githubusercontent.com/applitools/sdk.coverage.tests/universal-sdk/coverage-tests.js',
    ext: '.cs',
    outPath: './test/Images/coverage/generic',
    emitOnly: test => {
        return test.features && test.features.includes('image')
      },
};