import {type SpecDriver} from '@applitools/driver'
import * as spec from './spec-driver'

export * from './spec-driver'
export default spec satisfies SpecDriver<spec.Driver, spec.Driver, spec.Element, spec.Selector>
