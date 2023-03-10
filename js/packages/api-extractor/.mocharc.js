module.exports = {
  timeout: 0,
  require: ['ts-node/register'],
  reporter: 'mocha-multi',
  reporterOptions: [`spec=-`],
}
