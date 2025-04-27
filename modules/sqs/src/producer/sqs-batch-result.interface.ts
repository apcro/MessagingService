import {
  BatchResultErrorEntry,
  SendMessageBatchResultEntry,
} from '@aws-sdk/client-sqs'

/**
 * The result of a send message batch request executed by a producer.
 */
export interface SqsSendMessageBatchResult {
  /**
   * An array containing information about messages that were send successfully.
   */
  success: SendMessageBatchResultEntry[]
  /**
   * An array that contains a detailed description of each messaged that failed to send.
   */
  failed: BatchResultErrorEntry[]
}
