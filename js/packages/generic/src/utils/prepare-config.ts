import type {GenericConfig} from '../types.js'
import {merge} from './merge.js'

export async function prepareConfig(config: GenericConfig): Promise<Omit<GenericConfig, 'extends'>> {
  let currentConfig = config
  do {
    const {extends: baseConfigSpecifier, ...preparedConfig} = await resolveSpecifiers(currentConfig)
    if (baseConfigSpecifier) {
      currentConfig = merge((await import(baseConfigSpecifier)).config as GenericConfig, preparedConfig)
    }
  } while (currentConfig.extends)

  return currentConfig

  async function resolveSpecifiers(config: GenericConfig, parentSpecifier?: string) {
    return {
      ...config,
      extends: config.extends && (await import.meta.resolve!(config.extends, parentSpecifier)),
      tests: config.tests && (await import.meta.resolve!(config.tests, parentSpecifier)),
      emitter: config.emitter && (await import.meta.resolve!(config.emitter, parentSpecifier)),
      template: config.template && (await import.meta.resolve!(config.template, parentSpecifier)),
    }
  }
}
