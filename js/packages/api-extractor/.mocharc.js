module.exports = {
  timeout: 0,
  require: ['@swc-node/register'],
  reporter: 'mocha-multi',
  reporterOptions: [`spec=-`],
}
