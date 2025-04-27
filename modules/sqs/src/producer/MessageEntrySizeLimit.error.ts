import { BaseError } from '../util/base.error'
import { SqsMessageEntry } from './sqs-message-request.interface'

/**
 * An error indicating that the producer failed to send a message to SQS,
 * because the message exceeds the 256 KB size limit.
 */
export class MessageEntrySizeLimitError extends BaseError {
  constructor(message: SqsMessageEntry) {
    super(`${message} exceeds 256 KB size limit`)
  }
}
