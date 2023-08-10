const path = require('path')
const spec = require('@applitools/spec-driver-playwright')

async function build(env) {
  return spec.build({...env, extension: path.resolve(process.cwd(), './dist'), headless: 'new'})
}

async function visit(driver, url) {
  const result = await spec.visit(driver, url)
  // This is due to a race condition - when a user page (re)loads, the background.js page sends the global manager and eyes references to it.
  // but it could be that the values of `__applitools.manager` or `__applitools.eyes` would be read before they are set on the page.
  // To mitigate it, we introduce this delay. But it's clearly a limitation of the extension.
  await new Promise(r => setTimeout(r, 100))
  return result
}

module.exports = {...spec, build, visit}
