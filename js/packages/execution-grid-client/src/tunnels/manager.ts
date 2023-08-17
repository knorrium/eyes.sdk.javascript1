import type {TunnelManagerSettings} from '../types'
import {type Logger} from '@applitools/logger'
import {makeTunnelClient, type Tunnel, type TunnelCredentials} from '@applitools/tunnel-client'
import * as utils from '@applitools/utils'

export interface TunnelManager {
  acquire(credentials: TunnelCredentials): Promise<Tunnel[]>
  release(tunnels: Tunnel[]): Promise<void>
  close(): Promise<void>
}

export async function makeTunnelManager({
  settings,
  logger,
}: {
  settings?: TunnelManagerSettings
  logger: Logger
}): Promise<TunnelManager & {close(): Promise<void>}> {
  const client = makeTunnelClient({settings, logger})
  const pools = new Map<string, Pool<Tunnel[], TunnelCredentials>>()

  return {acquire, release, close: client.close}

  async function acquire(credentials: TunnelCredentials): Promise<Tunnel[]> {
    const key = JSON.stringify(credentials)
    let pool = pools.get(key)!
    if (!pool) {
      pool = makePool({
        create: () => Promise.all(Array.from({length: settings?.groupSize ?? 1}, () => client.create(credentials))),
        destroy: tunnels => Promise.all(tunnels.map(tunnel => client.destroy(tunnel.tunnelId))).then(() => undefined),
        ...settings?.pool,
      })
      pools.set(key, pool)
    }

    return pool.acquire(credentials)
  }

  async function release(tunnels: Tunnel[]): Promise<void> {
    const key = JSON.stringify(tunnels[0].credentials)
    const pool = pools.get(key)!
    if (!pool) return
    await pool.release(tunnels)
  }
}

interface Pool<TResource, TResourceOptions> {
  acquire(options: TResourceOptions): Promise<TResource>
  get(): Promise<TResource | null>
  add(resource: TResource): Promise<void>
  use(resource: TResource): Promise<boolean>
  release(resource: TResource): Promise<boolean>
  destroy(resource: TResource): Promise<boolean>
}

interface PoolItem<TResource> {
  resource: TResource
  destroyed: boolean
  inuse: number
  expireAt: number
  timers?: {idle?: NodeJS.Timeout; expiration?: NodeJS.Timeout}
}

interface PendingItem<TResource> {
  resource: Promise<TResource>
  waiting: number
}

interface PoolOptions<TResource, TResourceOptions> {
  create(options: TResourceOptions): Promise<TResource>
  destroy(resource: TResource): Promise<void>
  maxInuse?: number
  timeout?: {idle?: number; expiration?: number}
}

function makePool<TResource, TResourceOptions = never>(
  options: PoolOptions<TResource, TResourceOptions>,
): Pool<TResource, TResourceOptions> {
  const pool = new Map<string, PoolItem<TResource>>()
  const pending = new Set<PendingItem<TResource>>()

  return {
    acquire,
    add,
    get,
    use,
    release,
    destroy,
  }

  async function acquire(resourceOptions: TResourceOptions): Promise<TResource> {
    let resource = await get()!
    if (!resource) {
      resource = await create(resourceOptions)
      await add(resource)
    }
    await use(resource)
    return resource
  }

  async function create(resourceOptions: TResourceOptions): Promise<TResource> {
    const availableItem = [...pending].reduce((availableItem, item) => {
      return (!options.maxInuse || item.waiting < options.maxInuse) &&
        (!availableItem || availableItem.waiting > item.waiting)
        ? item
        : availableItem
    }, null as PendingItem<TResource> | null)

    if (availableItem) {
      availableItem.waiting += 1
      return availableItem.resource
    }

    const resource = options.create(resourceOptions)
    const item = {resource, waiting: 1} as PendingItem<TResource>
    resource.finally(() => pending.delete(item))
    pending.add(item)
    return resource
  }

  async function add(resource: TResource): Promise<void> {
    const item = {
      resource,
      destroyed: false,
      inuse: 0,
    } as PoolItem<TResource>
    if (options.timeout?.expiration) {
      item.timers ??= {}
      item.timers.expiration = setTimeout(() => destroy(resource), options.timeout.expiration)
      item.expireAt = Date.now() + options.timeout.expiration
    }
    pool.set(JSON.stringify(resource), item)
  }

  async function get(): Promise<TResource | null> {
    const freeItem = [...pool.values()].reduce((freeItem, item) => {
      return !item.destroyed &&
        (!options.maxInuse || item.inuse < options.maxInuse) &&
        (!freeItem || freeItem.inuse > item.inuse)
        ? item
        : freeItem
    }, null as PoolItem<TResource> | null)

    return freeItem?.resource ?? null
  }

  async function use(resource: TResource): Promise<boolean> {
    const item = pool.get(JSON.stringify(resource))
    if (!item) return false
    if (item.timers?.idle) clearTimeout(item.timers?.idle)
    item.inuse += 1
    return true
  }

  async function release(resource: TResource): Promise<boolean> {
    const item = pool.get(JSON.stringify(resource))
    if (!item) return false
    item.inuse -= 1
    if (item.destroyed) await destroy(resource)
    else if (!utils.types.isNull(options.timeout?.idle) && item.inuse <= 0) {
      if (options.timeout!.idle > 0) {
        item.timers ??= {}
        item.timers.idle = setTimeout(() => destroy(resource), options.timeout!.idle)
      } else {
        await destroy(resource)
      }
    }
    return true
  }

  async function destroy(resource: TResource): Promise<boolean> {
    const item = pool.get(JSON.stringify(resource))
    if (!item) return false
    item.destroyed = true
    if (item.inuse > 0) return false
    if (item.timers?.idle) clearTimeout(item.timers?.idle)
    if (item.timers?.expiration) clearTimeout(item.timers?.expiration)
    await options.destroy(item.resource)
    return true
  }
}
