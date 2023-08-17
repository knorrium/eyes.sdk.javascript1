import type {MaybeArray} from '@applitools/utils'
import {handleUnknowns} from './utils/handle-unknowns.js'
import * as utils from '@applitools/utils'

export type Emitter = any

export interface Ref {
  readonly isRef: true
  _deref: Deref
  _name?: string
  _type?: Type
  ref(): string
  ref(name: string): this
  type(): Type | undefined
  type(type: TypeSource): this
  as(type: TypeSource): Ref
  methods(methods: Record<string, (...args: any) => any>): this

  // [key: string]: Ref
  // (...args: any[]): Ref
}

export type Deref = string | ((options: {name?: string; type?: Type}) => string)

export interface Type extends Record<string, any> {
  name: string
  generic?: Type[]
  cast?: SyntaxEmitters['cast']
  call?: SyntaxEmitters['call']
  schema?: Record<string, TypeSource & {rename?: string}>
  items?: TypeSource
  recursive?: boolean
}

export type TypeSource = string | (Omit<Type, 'name' | 'generic'> & {type: string})

export interface OperatorEmitters {
  add(left: Ref | string, right: Ref | string): Ref
  sub(left: Ref | string, right: Ref | string): Ref
  mul(left: Ref | string, right: Ref | string): Ref
  div(left: Ref | string, right: Ref | string): Ref
  pow(left: Ref | string, right: Ref | string): Ref
}

export interface SyntaxEmitters {
  var(options: {name: string; value: string; type?: Type; constant?: boolean}): string
  return(options: {value: string; type?: Type}): string
  getter(options: {target: string; key: string; type?: Type}): string
  call(options: {target: string; args: string[]; type?: Type}): string
  cast(options: {target: string; castType: Type; currentType?: Type}): string
}

export function makeEmitter(): Emitter {
  const commands = {} as Record<string, string[]>
  const types = {} as Record<string, any>
  const syntax = handleUnknowns({} as SyntaxEmitters, {
    message: name =>
      `Emitter doesn't have an implementation for "${name}" syntax. Use ".addSyntax('${name}', <impl>)" method to add an implementation`,
  })
  const operators = handleUnknowns({} as OperatorEmitters, {
    message: name =>
      `Emitter doesn't have an implementation for "${name}" operator. Use ".addOperator('${name}', <impl>)" method to add an implementation`,
  })
  operators.add = (left, right) => makeRef(() => `${deref(left)} + ${deref(right)}`)
  operators.sub = (left, right) => makeRef(() => `${deref(left)} - ${deref(right)}`)
  operators.mul = (left, right) => makeRef(() => `${deref(left)} * ${deref(right)}`)
  operators.div = (left, right) => makeRef(() => `${deref(left)} / ${deref(right)}`)
  operators.pow = (left, right) => makeRef(() => `${deref(left)} ** ${deref(right)}`)

  return {
    commands,
    makeRef,
    useRef: makeRef,
    withScope,
    addSyntax,
    addExpression,
    addCommand,
    addType,
    addOperator,
    context: {operators, ref},
  }

  function ref(name: string, value: Ref | unknown) {
    return isRef(value) ? value.ref(name) : value
  }

  function deref(value: Ref | string) {
    return isRef(value) ? value.ref() : value
  }

  function addCommand(
    command: MaybeArray<string | (() => Ref | void)>,
    {group = 'default'}: {group?: string} = {},
  ): Ref | undefined {
    if (utils.types.isArray(command)) {
      const [result] = command.map(command => {
        if (utils.types.isFunction(command)) {
          const result = command()
          if (result?.isRef) {
            addCommand(syntax.return({value: result.ref(), type: result.type()}), {group})
          }
        } else {
          return addCommand(command, {group})
        }
      })
      return result
    }
    commands[group] ??= []
    const id = commands[group].push(utils.types.isFunction(command) ? (command() as any) : command)
    return makeRef(({name = `var_${id}`, type}) => {
      const value = commands[group][id - 1]
      commands[group][id - 1] = syntax.var({constant: true, name, value, type})
      return name
    })
  }

  function addExpression(expression: string) {
    commands.default ??= []
    const id = commands.default.push('') - 1
    return makeRef(({name, type}) => {
      if (name) {
        commands.default[id] = syntax.var({constant: true, name, value: expression, type})
        return name
      } else {
        return expression
      }
    })
  }

  function addSyntax<TName extends keyof SyntaxEmitters>(name: TName, emitter: SyntaxEmitters[TName]) {
    syntax[name] = emitter
  }

  function addOperator<TName extends keyof OperatorEmitters>(name: TName, emitter: OperatorEmitters[TName]) {
    operators[name] = emitter
  }

  function addType(name: string, options: Record<string, any>) {
    types[name] = {...options, name}
  }

  function makeType(type: Type | TypeSource): Type {
    if (utils.types.isObject(type)) {
      return utils.types.has(type, 'name') ? type : {...type, ...makeType(type.type)}
    } else if (!utils.types.isString(type)) {
      throw new Error('Type format is incorrect')
    }

    const match = type.match(/(?<name>[A-Za-z][A-Za-z0-9_]*)(<(?<generic>.*)>)?/)
    if (!match) {
      throw new Error('Type format is incorrect. Please follow the convention (e.g. TypeName or Type1<Type2, Type3>)')
    }

    return {
      ...types[match.groups!.name],
      name: match.groups!.name,
      generic: match.groups!.generic?.split(/, ?/).map(makeType),
    }
  }

  function isRef(value: any): value is Ref {
    return value.isRef
  }

  function makeRef(deref: string | ((options: {name?: string; type?: Type}) => string), type?: TypeSource | Type): Ref {
    const ref = <Ref>{
      isRef: true,
      _deref: deref,
      _name: undefined,
      _type: type ? makeType(type) : undefined,

      ref(name) {
        if (!name) {
          if (utils.types.isFunction(ref._deref)) {
            ref._deref = ref._deref({name: ref._name, type: ref._type})
          }
          return ref._deref
        }
        ref._name = name
        return this
      },
      type(type) {
        if (!type) return ref._type
        ref._type = makeType(type)
        return this
      },
      as(type) {
        const castType = makeType(type)
        const currentType = ref.type()
        const cast = currentType?.cast ?? syntax.cast
        return makeRef(() => cast({target: ref.ref(), currentType, castType}), castType)
      },
      methods(methods) {
        Object.entries(methods).forEach(([name, func]) => ((ref as any)[name] = func.bind(null, this)))
        return this
      },
    }

    const base: any = function () {
      return undefined
    }
    return new Proxy(base, {
      get(_target, key, proxy) {
        if (key in ref) return Reflect.get(ref, key, proxy)
        const target = ref.ref()
        const currentType = ref.type()
        const getter = currentType?.getter ?? syntax.getter

        if (key === Symbol.iterator && currentType?.iterable) {
          const index = 0
          return () => ({next: () => ({value: proxy[index], done: false})})
        }

        key = JSON.stringify(key).slice(1, -1)
        if (currentType) {
          if (currentType?.schema?.[key]) {
            const propType = currentType.schema[key]
            return makeRef(() => getter({target, type: currentType, key: propType.rename ?? key}), propType)
          } else if (currentType?.items) {
            return makeRef(() => getter({target, type: currentType, key}), currentType.items)
          } else if (currentType?.recursive) {
            return makeRef(() => getter({target, type: currentType, key}), currentType)
          }
        }
        return makeRef(() => getter({target, type: currentType, key}))
      },
      apply(_target, _this, args) {
        const type = ref.type()
        const call = type?.call ?? syntax.call
        return makeRef(() => call({target: ref.ref(), args: Array.from(args), type}))
      },
    })
  }

  function withScope(logic: (...args: Ref[]) => any, scope = []) {
    return () => logic(...scope.map(name => makeRef(name)))
  }
}
