import {CoreError} from '@applitools/core-base'

export class AbortError extends CoreError {
  constructor(message: string, info?: Record<string, any>) {
    super(message, {reason: 'abort', ...info})
  }
}
