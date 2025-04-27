import {
  ChangeMessageVisibilityBatchCommand,
  DeleteMessageBatchCommand,
  DeleteMessageBatchResult,
  Message,
  ReceiveMessageCommand,
  ReceiveMessageRequest,
  ReceiveMessageResult,
  SQSClient,
} from '@aws-sdk/client-sqs'
import { Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SqsQueueInfo } from '../sqs-queue-info'
import {
  DELAY_MILLISECONDS_ON_EMPTY_QUEUE,
  MAX_RECEIVE_MESSAGE_BATCH_SIZE,
} from '../sqs.constants'
import { getEventForQueue } from '../util/get-event-for-queue.util'
import {
  InvalidBatchSizeError,
  InvalidHeartbeatIntervalError,
  MissingVisibilityTimeoutError,
} from './invalid-consumer-option.error'
import { ConcurrentMessageProcessor } from './processor/concurrent-message.processor'
import { SequentialMessageProcessor } from './processor/sequential-message.processor'
import { SqsMessageProcessor } from './processor/sqs-message-processor.interface'
import {
  ProcessingMode,
  SqsConsumerOptions,
} from './sqs-consumer-options.interface'
import { SqsMessageDeleteError } from './sqs-message-delete.error'
import {
  MessageProcessedEvent,
  MessageReceivedEvent,
  SqsErrorEvent,
  SqsQueueEvent,
} from './sqs-queue.events'
import { SqsMessageError } from './sqs.message.error'

export class SqsConsumer {
  private readonly queueInfo: SqsQueueInfo

  private readonly handleMessageTimeout?: number
  private readonly attributeNames: string[]
  private readonly messageAttributeNames: string[]
  private readonly batchSize: number
  private readonly visibilityTimeout?: number
  private readonly waitTimeSeconds: number
  private readonly pollingWaitTimeMs: number
  private readonly terminateVisibilityTimeout: boolean
  private readonly heartbeatInterval?: number

  private stopped: boolean
  private currentPoll?: Promise<void>
  private pollingTimer?: NodeJS.Timeout

  private readonly sqs: SQSClient
  private readonly messageProcessor: SqsMessageProcessor
  private readonly eventEmitter: EventEmitter2
  private readonly logger: Logger

  constructor(
    queueInfo: SqsQueueInfo,
    client: SQSClient,
    eventEmitter: EventEmitter2,
    handleMessage: (message: Message) => Promise<void>,
    options?: SqsConsumerOptions,
    logger = new Logger(`${SqsConsumer.name}-${queueInfo.name}`),
  ) {
    SqsConsumer.assertOptions(options)

    this.queueInfo = queueInfo
    this.sqs = client
    this.messageProcessor =
      options?.processingMode === ProcessingMode.CONCURRENT
        ? new ConcurrentMessageProcessor(handleMessage)
        : new SequentialMessageProcessor(handleMessage)

    this.eventEmitter = eventEmitter
    this.stopped = true

    this.handleMessageTimeout = options?.handleMessageTimeout
    this.attributeNames = options?.attributeNames ?? []
    this.messageAttributeNames = options?.messageAttributeNames ?? []
    this.batchSize = options?.batchSize ?? 1
    this.visibilityTimeout = options?.visibilityTimeout
    this.terminateVisibilityTimeout =
      options?.terminateVisibilityTimeout ?? false
    this.heartbeatInterval = options?.heartbeatInterval
    this.waitTimeSeconds = options?.waitTimeSeconds ?? 20
    this.pollingWaitTimeMs = options?.pollingWaitTimeMs ?? 0

    this.logger = logger
  }

  get isRunning(): boolean {
    return !this.stopped
  }

  start(): void {
    if (this.stopped) {
      this.logger.debug('Starting')
      this.stopped = false
      this.currentPoll = this.poll()
      this.logger.debug('Started')
    }
  }

  async stop() {
    this.logger.debug('Stopping')

    // When the consumer is currently waiting for a next poll, cancel it.
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer)
      this.pollingTimer = undefined
    }

    // Wait until the consumer finished processing messages to ensure that we don't drop any messages.
    if (this.currentPoll) {
      this.logger.debug('wait until current batch of messages is processed')
      await this.currentPoll
      this.currentPoll = undefined
    }

    this.stopped = true

    this.eventEmitter.emit(
      getEventForQueue(SqsQueueEvent.STOPPED, this.queueInfo.name),
    )
    this.logger.debug('Stopped')
  }

  private async poll(): Promise<void> {
    if (this.stopped) {
      return
    }

    this.logger.debug('Started polling for messages')

    const receiveParams = {
      QueueUrl: this.queueInfo.url,
      AttributeNames: this.attributeNames,
      MessageAttributeNames: this.messageAttributeNames,
      MaxNumberOfMessages: this.batchSize,
      WaitTimeSeconds: this.waitTimeSeconds,
      VisibilityTimeout: this.visibilityTimeout,
    }

    let currentPollingTimeout = this.pollingWaitTimeMs

    try {
      const response = await this.receiveMessage(receiveParams)

      if (response.Messages && response.Messages.length > 0) {
        this.logger.debug(`Received ${response.Messages.length} messages`)
        await this.processMessages(response.Messages)
      } else {
        // The queue was empty, increase the timeout.
        currentPollingTimeout = DELAY_MILLISECONDS_ON_EMPTY_QUEUE
        this.logger.debug('Receive message response empty')
      }
    } catch (error) {
      // The AWS SDK defaults to retry mode `standard` which means it will retry
      // request until it reaches the max number of attempts, `maxAttempts` which
      // defaults to 3. The retry delay is calculated using truncated exponential
      // backoff. The `maxAttempts` setting can be changed through the options that
      // are passed to `forRoot`. For now it is best to increase the setting so that
      // we can rely on the SDK logic, although we might want to consider implementing
      // our own backoff on top of the SDK or introduce a max number of attempts.
      currentPollingTimeout = DELAY_MILLISECONDS_ON_EMPTY_QUEUE
      this.logger.error(`Failed to receive messages - ${error}`)
    } finally {
      this.logger.debug('Schedule next poll')
      this.schedulePollingTimer(currentPollingTimeout)
    }
  }

  private schedulePollingTimer(timeout: number) {
    try {
      const poll = () => {
        this.currentPoll = this.poll()
      }
      this.pollingTimer = setTimeout(poll.bind(this), timeout)
    } catch (error) {
      this.logger.error(`Failed to schedule poll, error: ${error}`)

      this.eventEmitter.emit(
        getEventForQueue(SqsQueueEvent.ERROR, this.queueInfo.name),
        new SqsErrorEvent(error),
      )
    }
  }

  private async receiveMessage(
    params: ReceiveMessageRequest,
  ): Promise<ReceiveMessageResult> {
    try {
      this.eventEmitter.emit(
        getEventForQueue(
          SqsQueueEvent.MESSAGE_RECEIVE_START,
          this.queueInfo.name,
        ),
      )

      const command = new ReceiveMessageCommand(params)
      const response = await this.sqs.send(command)

      this.eventEmitter.emit(
        getEventForQueue(
          SqsQueueEvent.MESSAGE_RECEIVE_END,
          this.queueInfo.name,
        ),
        new MessageReceivedEvent(response.Messages ?? []),
      )

      return response
    } catch (error) {
      this.eventEmitter.emit(
        getEventForQueue(
          SqsQueueEvent.MESSAGE_RECEIVE_END,
          this.queueInfo.name,
        ),
        new SqsErrorEvent(error),
      )
      throw error
    }
  }

  private async processMessages(messages: Message[]): Promise<void> {
    this.eventEmitter.emit(
      getEventForQueue(
        SqsQueueEvent.MESSAGE_PROCESSING_START,
        this.queueInfo.name,
      ),
    )

    let success: Message[] = []
    let failed: SqsMessageError[] = []

    let heartbeat: NodeJS.Timeout | undefined
    if (this.heartbeatInterval && this.visibilityTimeout) {
      this.logger.debug('Heartbeat fired')

      const visibilityTimeout = this.visibilityTimeout
      heartbeat = this.startHeartbeat(this.heartbeatInterval, async () => {
        // Swallows the error, because the consumer doesn't stop processing messages
        // after it fails to change the visibility timeout. This means it still has a chance
        // to successfully delete (acknowledge) the messages.
        await this.changeVisibilityTimeoutBatch(messages, visibilityTimeout)
      })
    }

    const processingResult = await this.messageProcessor.process(
      messages,
      this.handleMessageTimeout,
    )

    if (heartbeat) {
      // Clear heartbeat to prevent race between heartbeat and delete batch request.
      clearInterval(heartbeat)
    }

    if (processingResult.failed.length > 0) {
      failed = processingResult.failed
    }

    if (processingResult.success.length > 0) {
      this.logger.debug(
        `Deleting messages ${messages.map((msg) => msg.MessageId).join(' ,')}`,
      )

      success = processingResult.success

      try {
        const deleteResult = await this.deleteMessageBatch(success)

        if (deleteResult?.Failed && deleteResult.Failed.length > 0) {
          // We failed to delete (acknowledge) some of the messages, thus we need to
          // report them as failed instead of processed.
          deleteResult.Failed.forEach((entry) => {
            const index = success.findIndex((message) => {
              return message.MessageId === entry.Id
            })

            if (index) {
              const removed = processingResult.success.splice(index, 1)
              const error = new SqsMessageDeleteError(entry)
              failed.push(new SqsMessageError(error, removed[0]))
            }
          })
        }
      } catch (error) {
        // The request to delete messages from the queue failed, therefore we need to report all
        // messages as failed, even though they were successfully processed. They will appear again in
        // the queue as soon as the visibility timeout ends.
        success.forEach((message) => {
          failed.push(new SqsMessageError(error, message))
        })
        success = []
      }
    }

    this.eventEmitter.emit(
      getEventForQueue(
        SqsQueueEvent.MESSAGE_PROCESSING_END,
        this.queueInfo.name,
      ),
      new MessageProcessedEvent(success, failed),
    )

    if (this.terminateVisibilityTimeout) {
      // Ensure messages become immediately visible in the queue,.
      this.logger.debug('Terminating visibility timeout after failure')
      await this.changeVisibilityTimeoutBatch(
        failed.map((message) => message.message),
        0,
      )
    }
  }

  private async deleteMessageBatch(
    messages: Message[],
  ): Promise<DeleteMessageBatchResult> {
    const command = new DeleteMessageBatchCommand({
      QueueUrl: this.queueInfo.url,
      Entries: messages.map((message) => ({
        Id: message.MessageId,
        ReceiptHandle: message.ReceiptHandle,
      })),
    })

    return await this.sqs.send(command)
  }

  private async changeVisibilityTimeoutBatch(
    messages: Message[],
    timeout: number,
  ) {
    this.logger.debug(
      `Change visibility timeout of ${this.visibilityTimeout} for ${messages
        .map((msg) => msg.MessageId)
        .join(' ,')}`,
    )
    const command = new ChangeMessageVisibilityBatchCommand({
      QueueUrl: this.queueInfo.url,
      Entries: messages.map((message) => ({
        Id: message.MessageId,
        ReceiptHandle: message.ReceiptHandle,
        VisibilityTimeout: timeout,
      })),
    })

    try {
      return await this.sqs.send(command)
    } catch (error) {
      this.logger.error(`Failed to change visibility, error: ${error}`)

      this.eventEmitter.emit(
        getEventForQueue(SqsQueueEvent.ERROR, this.queueInfo.name),
        new SqsErrorEvent(error),
      )
    }
  }

  private startHeartbeat(
    interval: number,
    heartbeatFn: () => Promise<void>,
  ): NodeJS.Timeout {
    return setInterval(async () => {
      await heartbeatFn()
    }, interval * 1000)
  }

  private static assertOptions(options?: SqsConsumerOptions): void {
    if (!options) return

    const batchSize = options.batchSize
    const invalidBatchSize =
      batchSize !== undefined &&
      (batchSize > MAX_RECEIVE_MESSAGE_BATCH_SIZE || batchSize < 1)

    if (invalidBatchSize) {
      throw new InvalidBatchSizeError(batchSize)
    }

    if (options.heartbeatInterval === undefined) return

    if (options.visibilityTimeout === undefined) {
      throw new MissingVisibilityTimeoutError()
    }

    if (options.heartbeatInterval >= options.visibilityTimeout) {
      throw new InvalidHeartbeatIntervalError(
        options.heartbeatInterval,
        options.visibilityTimeout,
      )
    }
  }
}
