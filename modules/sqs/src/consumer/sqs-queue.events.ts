import { Message } from '@aws-sdk/client-sqs'
import { SqsMessageError } from './sqs.message.error'

/**
 * All possible events that an `SqsConsumer` can emit.
 */
export enum SqsQueueEvent {
  MESSAGE_RECEIVE_START = 'message.receive.start',
  MESSAGE_RECEIVE_END = 'message.receive.end',
  MESSAGE_PROCESSING_START = 'message.processing.start',
  MESSAGE_PROCESSING_END = 'message.processing.end',
  ERROR = 'error',
  STOPPED = 'stopped',
}

/**
 * The payload of an event that gets emitted when a consumer received one or more message
 * of the queue.
 */
export class MessageReceivedEvent {
  constructor(readonly message: Message[]) {}
}

/**
 * The payload of an event that gets emitted when the consumer has finished processing messages.
 */
export class MessageProcessedEvent {
  constructor(
    readonly success: Message[],
    readonly failed: SqsMessageError[] = [],
  ) {}
}

/**
 * The payload of an event that gets emitted when a generic error occurred in a consumer of a specific queue.
 * These errors are typically related to some sort of SQS operation, for example message receive.
 */
export class SqsErrorEvent {
  readonly error: Error

  constructor(error: unknown, readonly message?: Message) {
    this.error =
      error instanceof Error
        ? error
        : Error(`Unknown sqs consumer error ${error}`)
  }
}
