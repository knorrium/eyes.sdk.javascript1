let ref = "universal-sdk";
let dir = `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}`
module.exports = {
    name: "py-images",
    emitOnly: test => {
        return test.features && test.features.includes("image")
    },
    emitter: `${dir}/python/emitter.js`,
    overrides: [`${dir}/js/overrides.js`, `${dir}/python/overrides.js`],
    template: `${dir}/python/images-template.hbs`,
    tests: `${dir}/coverage-tests.js`,
    fixtures: `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}/fixtures/fixtures.zip`,
    ext: ".py",
    outPath: "./generic",
}
