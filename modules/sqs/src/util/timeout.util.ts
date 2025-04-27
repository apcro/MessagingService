import { BaseError } from './base.error'

export interface TimeoutResponse {
  timeout: NodeJS.Timeout | undefined
  pending: Promise<void>
}

export class TimeoutError extends BaseError {
  constructor(operation: string, timeout: number) {
    super(`${operation} timed out after ${timeout}ms`)
    this.name = 'TimeoutError'
  }
}

export function createTimeout(
  duration: number,
  operation: string,
): TimeoutResponse {
  let timeout: NodeJS.Timeout | undefined
  const pending = new Promise<void>((_, reject) => {
    timeout = setTimeout((): void => {
      reject(new TimeoutError(operation, duration))
    }, duration)
  })
  return { timeout, pending }
}
