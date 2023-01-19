import {type Proxy} from '@applitools/req'

export interface EGClient {
  readonly url: string
  readonly port: number
  close(): void
}

export interface EGClientSettings {
  serverUrl: string
  proxy?: Proxy
  capabilities?: EGCapabilities
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

export interface EGCapabilities {
  eyesServerUrl?: string
  apiKey?: string
  timeout?: number | string
  inactivityTimeout?: number | string
  useSelfHealing?: boolean
}
