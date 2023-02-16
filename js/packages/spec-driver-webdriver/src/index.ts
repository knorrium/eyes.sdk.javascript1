import type {SpecDriver} from '@applitools/driver'
import * as spec from './spec-driver'

export * from './spec-driver'

const typedSpec: SpecDriver<spec.SpecType> = spec
export default typedSpec
