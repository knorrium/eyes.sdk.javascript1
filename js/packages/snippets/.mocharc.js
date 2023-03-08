module.exports = {
  timeout: 0,
  exit: true,
  require: ['ts-node/register'],
  reporter: 'mocha-multi',
  reporterOptions: ['spec=-,json=./logs/report.json'],
}
