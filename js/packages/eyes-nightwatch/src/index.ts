export * from './api'

if (!process.env.APPLITOOLS_FRAMEWORK_MAJOR_VERSION) {
  try {
    const {version} = process.env.APPLITOOLS_FRAMEWORK_VERSION ?? require('nightwatch/package.json')
    const [major] = version.split('.', 1)
    process.env.APPLITOOLS_FRAMEWORK_MAJOR_VERSION = major
  } catch {
    // NOTE: ignore error
  }
}
