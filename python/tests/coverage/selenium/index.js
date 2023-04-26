let ref = "universal-sdk";
let dir = `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}`
module.exports = {
    name: "py-selenium",
    emitter: `${dir}/python/emitter.js`,
    emitOnly: test => {
        let env = test.env || {}
        let features = test.features || []
        return !("device" in env) &&
            !features.includes("image") &&
            !features.includes("cached-selectors");
    },
    overrides: [`${dir}/js/overrides.js`, `${dir}/python/overrides.js`],
    template: `${dir}/python/selenium-template.hbs`,
    tests: `${dir}/coverage-tests.js`,
    ext: ".py",
    outPath: "./generic",
}
