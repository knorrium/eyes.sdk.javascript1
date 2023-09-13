const group = process.env.MOCHA_GROUP

module.exports = {
  timeout: 3000,
  require: ['@swc-node/register'],
  reporter: 'mocha-multi',
  reporterOptions: [`spec=-,json=./logs/report${group ? `-${group}` : ''}.json`],
}
