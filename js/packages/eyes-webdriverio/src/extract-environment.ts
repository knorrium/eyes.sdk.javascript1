export function extractEnvironment(): Record<string, any> {
  const versions = {} as Record<string, string>
  try {
    const {name, version} = require('webdriverio/package.json')
    versions[name] = version
  } catch {
    // NOTE: ignore error
  }
  return {versions}
}
