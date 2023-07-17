export enum AbortReasons {
  requestTimeout = 'STUCK_REQUEST',
  connectionTimeout = 'MAX_TIMEOUT_REACHED',
}

export class RequestTimeoutError extends Error {
  code = AbortReasons.requestTimeout
  constructor() {
    super('Request timed out, likely because it was stuck.')
    this.name = 'RequestTimeoutError'
  }
}

export class ConnectionTimeoutError extends Error {
  code = AbortReasons.connectionTimeout
  constructor() {
    super('The connection timed out.')
    this.name = 'ConnectionTimeoutError'
  }
}
