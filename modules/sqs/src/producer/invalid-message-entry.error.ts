import { BaseError } from '../util/base.error'

/**
 * An error that gets thrown when a message that is send to the queue is invalid.
 */
export class InvalidMessageEntryError extends BaseError {}

export class InvalidMessageBodyError extends InvalidMessageEntryError {
  constructor() {
    super("Invalid message entry: `Messagebody` can't be null or empty.")
  }
}

export class MissingGroupIdError extends InvalidMessageEntryError {
  constructor() {
    super(
      'Invalid message entry: groupId is required for entry when using FIFO queue',
    )
  }
}

export class InvalidMessageDelayError extends InvalidMessageEntryError {
  constructor(delay: number) {
    super(`Invalid message entry: delay ${delay} must be within range of 0-900`)
  }
}
