const {exec} = require('child_process')
const {promisify: p} = require('util')
const pexec = p(exec)

const nodeMajorVersion = process.version.match(/\d+/)[0] - ''
const env = {...process.env}
if (nodeMajorVersion >= 18) {
  env.NODE_OPTIONS = '--openssl-legacy-provider'
}

function pexecWarpper(cmd, options) {
  const promisePPexec = pexec(cmd, {...options, env})
  console.log(`$ ${cmd}`)
  // const {child} = promisePPexec
  // child.stdout.on('data', msg => {
  //   console.log(msg)
  // })
  return promisePPexec
}

function cypress(cmd, options) {
  return pexecWarpper(`yarn cypress ${cmd}`, options)
}

pexecWarpper.cypress = cypress

module.exports = pexecWarpper
