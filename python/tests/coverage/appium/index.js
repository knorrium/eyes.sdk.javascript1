let ref = "universal-sdk";
let dir = `https://raw.githubusercontent.com/applitools/sdk.coverage.tests/${ref}`
module.exports = {
    name: "py-appium",
    emitter: `${dir}/python/emitter.js`,
    emitOnly: test => {
      return "env" in test && "device" in test.env;
    },
    overrides: [`${dir}/js/overrides.js`, `${dir}/python/overrides.js`],
    template: `${dir}/python/selenium-template.hbs`,
    tests: `${dir}/coverage-tests.js`,
    ext: ".py",
    outPath: "./generic",
}
