import type {GenericConfig} from '../types.js'
import {merge} from './merge.js'
import * as utils from '@applitools/utils'
import * as url from 'url'

export async function prepareConfig(config: GenericConfig): Promise<Omit<GenericConfig, 'extends'>> {
  let currentConfig = config
  let parentSpecifier: string | undefined = url.pathToFileURL(process.cwd()).href + '/'
  while (parentSpecifier) {
    const {extends: baseConfigSpecifier, ...preparedConfig} = await resolveSpecifiers(currentConfig, parentSpecifier)
    if (baseConfigSpecifier) {
      parentSpecifier = baseConfigSpecifier
      currentConfig = merge((await import(baseConfigSpecifier)).config as GenericConfig, preparedConfig)
    } else {
      parentSpecifier = undefined
      currentConfig = preparedConfig
    }
  }

  return currentConfig

  async function resolveSpecifiers(config: GenericConfig, parentSpecifier?: string) {
    config.extends &&= new URL(config.extends, parentSpecifier).href
    config.tests &&= new URL(config.tests, parentSpecifier).href
    config.overrides &&= await Promise.all(
      (utils.types.isArray(config.overrides) ? config.overrides : [config.overrides]).map(overrides =>
        utils.types.isString(overrides) ? import.meta.resolve!(overrides, parentSpecifier) : overrides,
      ),
    )
    config.emitter &&= new URL(config.emitter, parentSpecifier).href
    config.template &&= new URL(config.template, parentSpecifier).href
    config.fixtures &&= url.fileURLToPath(new URL(config.fixtures, parentSpecifier).href)
    return config
  }
}
