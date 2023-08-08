export function extractEnvironment(options: Cypress.PluginConfigOptions): Record<string, any> {
  const versions = {} as Record<string, string>
  try {
    const {name, version} = require('cypress/package.json')
    versions[name] = version
  } catch {
    // NOTE: ignore error
  }
  return {versions, testingType: options?.testingType ?? 'e2e'}
}
