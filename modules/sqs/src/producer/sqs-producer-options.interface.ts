/**
 * Options used to create a producer for a given queue.
 */
export interface SqsProducerOptions {
  /**
   * The name of the queue in AWS.
   */
  queueName: string

  /**
   * The amount of messages that can go into a single batch (defaults to 10).
   * The maximum is 10.
   */
  batchSize?: number
}
