const {mochaGrep} = require('@applitools/test-utils')

const group = process.env.MOCHA_GROUP

module.exports = {
  reporter: [
    {name: 'spec'},
    {name: 'json', output: `./logs/report${group ? `-${group}` : ''}.json`},
    {name: 'xunit', output: './logs/report.xml'}
  ],
  compilerOptions: {
    typescript: {
      customCompilerModulePath: require.resolve(`typescript`)
    }
  },
  filter: {
    testGrep: mochaGrep()
  }
}