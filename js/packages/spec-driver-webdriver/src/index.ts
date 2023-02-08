import {type SpecType, type SpecDriver} from '@applitools/driver'
import * as spec from './spec-driver'

export * from './spec-driver'

const typedSpec: SpecDriver<SpecType<spec.Driver, spec.Driver, spec.Element, spec.Selector>> = spec
export default typedSpec
