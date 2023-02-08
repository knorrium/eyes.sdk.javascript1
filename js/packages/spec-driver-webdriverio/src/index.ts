import {type SpecType, type SpecDriver} from '@applitools/driver'
import * as spec from './spec-driver'

if (!process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION) {
  try {
    const version = process.env.APPLITOOLS_WEBDRIVERIO_VERSION ?? require('webdriverio/package.json').version
    const [major] = version.split('.', 1)
    process.env.APPLITOOLS_WEBDRIVERIO_MAJOR_VERSION = major
  } catch {
    // NOTE: ignore error
  }
}

export * from './spec-driver'

const typedSpec: SpecDriver<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>> = spec
export default typedSpec
