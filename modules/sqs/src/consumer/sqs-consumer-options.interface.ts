/**
 * Options used to configure an instance of SQSConsumer.
 */
export interface SqsConsumerOptions {
  /**
   * List of queue attributes to retrieve, for example `ApproximateFirstReceiveTimestamp` (optional).
   */
  attributeNames?: string[]

  /**
   * A list of attributes that need to be returned along with each message, for example `SentTimestamp` or `All` (optional).
   */
  messageAttributeNames?: string[]

  /**
   * The number of messages to request from SQS when polling (default to 1).
   * This can't be higher than the AWS limit of 10.
   */
  batchSize?: number

  /**
   * A period of time (in seconds) during which SQS prevents other consumers from receiving and processing the message (optional).
   * When you don't specify a timeout, it will default to the visibility timeout setting of the queue.
   */
  visibilityTimeout?: number

  /**
   * When the wait time of a receive message request is greater than 0, long polling is enabled (defaults to 20).
   * Long polling helps reduce the cost of using SQS by reducing empty response by allowing SQS to wait
   * until a message is available in a queue before sending a response. This can't be higher than the AWS limit of 20.
   */
  waitTimeSeconds?: number

  /**
   * The duration (in milliseconds) to wait before re-polling the queue (defaults to 0).
   */
  pollingWaitTimeMs?: number

  /**
   * If `true`, sets the message visibility timeout to 0 after a processing error (defaults to false).
   * This will cause the message to immediately reappear in the queue so that it can be picked up by another consumer.
   */
  terminateVisibilityTimeout?: boolean

  /**
   * The interval (in seconds) between requests to extend the message visibility timeout (optional). On each heartbeat the
   * visibility is extended by adding `visibilityTimeout` to the number of seconds since the start of the handler
   * function. This value must be less than the `visibilityTimeout`. This ensures messages are processed in a timely manner.
   * For example, if your app requires 10 seconds to process a message, but the `visibilityTimeout` is set to 15 minutes,
   * it takes a relatively long time before the message reappears in the queue after a failure. However, when the visibility timeout is
   * shorter than the time it takes to process a message, the message will reappear in the queue while it is still being
   * processed.
   */
  heartbeatInterval?: number

  /**
   * Time (in milliseconds) to wait for handleMessage to process a message before timing out (optional).
   * When a message times out the consumer will emit an error and the message will become visible again in the queue
   * after the `visibilityTimeout` is over.
   */
  handleMessageTimeout?: number

  /**
   * Which mode to use for processing messages (optional) (defaults to SEQUENTIAL).
   */
  processingMode?: ProcessingMode

  /**
   * Whether the consumer should automatically start on application bootstrap (defaults to `true`).
   */
  startOnApplicationBootstrap?: boolean
}

/**
 * Determines how the consumer will process messages when receiving multiple messages in batch.
 */
export enum ProcessingMode {
  /**
   * Messages in the batch will be processed sequentially.
   */
  SEQUENTIAL,
  /**
   * Messages in the batch will be processed in parallel.
   * When message processing contains asynchronous work, such as network request or other I/O,
   * this can improve performance.
   */
  CONCURRENT,
}
