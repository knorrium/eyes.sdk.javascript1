import type {SpecDriver} from '@applitools/driver'
import * as spec from './spec-driver'

if (!process.env.APPLITOOLS_FRAMEWORK_MAJOR_VERSION) {
  try {
    const version = process.env.APPLITOOLS_FRAMEWORK_VERSION || require('selenium-webdriver/package.json').version
    const [major] = version.split('.', 1)
    process.env.APPLITOOLS_FRAMEWORK_MAJOR_VERSION = major
  } catch {
    // NOTE: ignore error
  }
}

export * from './spec-driver'

const typedSpec: SpecDriver<spec.PrimarySpecType> = spec
export default typedSpec
