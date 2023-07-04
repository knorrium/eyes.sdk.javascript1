import {type IncomingMessage, type ServerResponse} from 'http'

interface Router {
  get(pattern: string | RegExp, callback: (options: {match: RegExpMatchArray}) => Promise<void> | void): void
  post(pattern: string | RegExp, callback: (options: {match: RegExpMatchArray}) => Promise<void> | void): void
  put(pattern: string | RegExp, callback: (options: {match: RegExpMatchArray}) => Promise<void> | void): void
  delete(pattern: string | RegExp, callback: (options: {match: RegExpMatchArray}) => Promise<void> | void): void
  any(pattern: string | RegExp, callback: (options: {match: RegExpMatchArray}) => Promise<void> | void): void
  fallback(callback: () => Promise<void> | void): void
  catch(callback: (options: {error: any}) => Promise<void> | void): void
  finally(callback: () => Promise<void> | void): void
}

export function makeCallback(
  handler: (options: {router: Router; request: IncomingMessage; response: ServerResponse}) => void,
) {
  return async function callback(request: IncomingMessage, response: ServerResponse) {
    const routes = [] as {
      method?: string
      pattern: string | RegExp
      callback: (options: {match: RegExpMatchArray}) => Promise<void> | void
    }[]
    const fallbacks = [] as {callback: () => Promise<void> | void}[]
    const catches = [] as {callback: (options: {error: any}) => Promise<void> | void}[]
    const finals = [] as {callback: () => Promise<void> | void}[]

    const router: Router = {
      get: (pattern, callback) => routes.push({method: 'GET', pattern, callback}),
      post: (pattern, callback) => routes.push({method: 'POST', pattern, callback}),
      put: (pattern, callback) => routes.push({method: 'PUT', pattern, callback}),
      delete: (pattern, callback) => routes.push({method: 'DELETE', pattern, callback}),
      any: (pattern, callback) => routes.push({pattern, callback}),
      fallback: callback => fallbacks.push({callback}),
      catch: callback => catches.push({callback}),
      finally: callback => finals.push({callback}),
    }

    handler({router, request, response})

    try {
      for (const {method, pattern, callback} of routes) {
        if ((!method || request.method === method) && request.url) {
          const regexp =
            pattern instanceof RegExp
              ? pattern
              : new RegExp(`^${pattern.replace(/:([^\/]+)/g, (_, name) => `(?<${name}>[^/]+)`)}/?$`)
          const match = request.url.match(regexp)
          if (match) {
            await callback({match})
            return
          }
        }
      }
      for (const {callback} of fallbacks) {
        await callback()
      }
    } catch (error: any) {
      for (const {callback} of catches) {
        await callback({error})
      }
    } finally {
      for (const {callback} of finals) {
        await callback()
      }
    }
  }
}
