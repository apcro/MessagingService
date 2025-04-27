import { BaseError } from '../util/base.error'

/**
 * An error indicating that the module wasn't able to construct a consumer because it
 * received invalid options through the `@SqsMessageHandler` decorator.
 */
export class InvalidConsumerOptionError extends BaseError {}

export class InvalidBatchSizeError extends InvalidConsumerOptionError {
  constructor(batchSize: number) {
    super(
      `Invalid consumer option: batchsize ${batchSize} must be between 0 and 10`,
    )
  }
}

export class InvalidHeartbeatIntervalError extends InvalidConsumerOptionError {
  constructor(interval: number, visibilityTimeout: number) {
    super(
      `Invalid consumer option: heartbeat interval ${interval} must be less than visibility timeout ${visibilityTimeout}`,
    )
  }
}

export class MissingVisibilityTimeoutError extends InvalidConsumerOptionError {
  constructor() {
    super(
      'Invalid consumer option: visibility timeout is required when using a heartbeat',
    )
  }
}
