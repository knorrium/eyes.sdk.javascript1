import {type Proxy} from '@applitools/req'

export interface ECClient {
  readonly url: string
  readonly port: number
  close(): void
}

export interface ECClientSettings {
  serverUrl: string
  proxy?: Proxy
  capabilities?: ECCapabilities
  port?: number
  /** @internal */
  tunnel?: {
    serverUrl?: string
    groupSize?: number
    pool?: {
      maxInuse?: number
      timeout?: {idle?: number; expiration?: number}
    }
  }
}

export interface ECCapabilities {
  eyesServerUrl?: string
  apiKey?: string
  timeout?: number | string
  inactivityTimeout?: number | string
  useSelfHealing?: boolean
}
