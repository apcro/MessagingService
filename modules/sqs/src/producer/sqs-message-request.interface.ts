import { SendMessageRequest } from '@aws-sdk/client-sqs'
import { randomUUID } from 'crypto'

/**
 * Contains the details of a single message that should be send to a SQS queue.
 */
export type SqsMessageEntry = Omit<SendMessageRequest, 'QueueUrl'>

/**
 * In addition to the details of a message also contains an `id` that uniquely identifies
 * the message within a batch.
 */
export interface SqsBatchMessageEntry {
  /**
   * Uniquely identifies a message within a batch. The `id` is only valid within the batch
   * request and is used when an error response refers to a specific `id` within batch.
   * and is used
   **/
  id: string

  /**
   * A message that is a part of a batch.
   */
  message: SqsMessageEntry
}

/**
 * A batch message entry with an automatic randomly generated UUID.
 */
export class DefaultBatchMessageEntry implements SqsBatchMessageEntry {
  readonly message: SqsMessageEntry

  constructor(message: SqsMessageEntry, readonly id = randomUUID()) {
    this.message = message
  }
}
