import {
  GetQueueAttributesCommand,
  GetQueueAttributesCommandOutput,
  SendMessageBatchCommand,
  SendMessageBatchResultEntry,
  SendMessageCommand,
  SendMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs'
import { Injectable, Scope } from '@nestjs/common'
import { SqsQueueInfo } from '../sqs-queue-info'
import {
  AWS_MESSAGE_SIZE_LIMIT,
  MAX_SEND_MESSAGE_BATCH_SIZE,
} from '../sqs.constants'
import { mapMessageToBatchErrorEntry } from '../util/batch-entry.util'
import { sizeOfMessage } from '../util/message-size.util'
import { InvalidProducerOptionError } from './invalid-producer-option.error'
import { MessageEntrySizeLimitError } from './MessageEntrySizeLimit.error'
import { SqsSendMessageBatchResult } from './sqs-batch-result.interface'
import {
  SqsBatchMessageEntry,
  SqsMessageEntry,
} from './sqs-message-request.interface'
import { SqsMessageEntryValidator } from './sqs-message-request.validator'
import { SqsMessageBatcher } from './sqs-message.batcher'

/**
 * A class that lets you enqueue messages on a given SQS queue.
 */
@Injectable({
  scope: Scope.TRANSIENT,
})
export class SqsProducer {
  private readonly messageBatcher: SqsMessageBatcher

  constructor(
    private readonly queueInfo: SqsQueueInfo,
    private readonly client: SQSClient,
    batchSize: number,
    private readonly validator = new SqsMessageEntryValidator(),
    private readonly messageSizeLimit = AWS_MESSAGE_SIZE_LIMIT,
  ) {
    if (batchSize < 0 || batchSize > MAX_SEND_MESSAGE_BATCH_SIZE) {
      throw new InvalidProducerOptionError(batchSize)
    }
    this.messageBatcher = new SqsMessageBatcher(batchSize, messageSizeLimit)
  }

  /**
   * Delivers a message to the SQS queue managed by the producer.
   * @param message The message to send.
   * @returns The result of the send message request
   * @throws will throw an error when the message is invalid or is larger than 256 KB.
   */
  async send(message: SqsMessageEntry): Promise<SendMessageCommandOutput> {
    this.validator.validateMessage(message, this.queueInfo.isFifo)

    if (sizeOfMessage(message) > this.messageSizeLimit) {
      throw new MessageEntrySizeLimitError(message)
    }

    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: this.queueInfo.url,
      ...message,
    })

    return this.client.send(sendMessageCommand)
  }

  /**
   * Delivers multiple messages to the SQS queue managed by the producer. Messages will be send
   * in one or more batches depending on the amount of messages and `batchSize` and bytesize of messages.
   *
   * @param messages The messages to send to the SQS queue.
   * @returns The result of the batch message send operation.
   * @throws will throw an error when one of the messages in the batch is invalid.
   **/
  async sendBatch(
    messages: SqsBatchMessageEntry[],
  ): Promise<SqsSendMessageBatchResult> {
    return this.sendMessageBatch(messages)
  }

  private async sendMessageBatch(
    messages: SqsBatchMessageEntry[],
  ): Promise<SqsSendMessageBatchResult> {
    this.validator.validateBatch(messages, this.queueInfo.isFifo)

    const batchResult = this.messageBatcher.packMessagesIntoBatches(messages)

    let successfulMessages: SendMessageBatchResultEntry[] = []
    let failedMessages =
      batchResult.failedEntries.map(mapMessageToBatchErrorEntry) ?? []

    for (const batch of batchResult.batches) {
      const sendMessageBatchCommand = new SendMessageBatchCommand({
        QueueUrl: this.queueInfo.url,
        Entries: batch,
      })

      const result = await this.client.send(sendMessageBatchCommand)
      if (result.Failed) {
        failedMessages = failedMessages.concat(result.Failed)
      }

      if (result.Successful) {
        successfulMessages = successfulMessages.concat(result.Successful)
      }
    }

    return { success: successfulMessages, failed: failedMessages }
  }

  /**
   * Requests the size of a given SQS queue
   * @returns The result of the send message request
   */
  async getQueueAttributes(): Promise<GetQueueAttributesCommandOutput> {
    const sendGetQueueMessageCommand = new GetQueueAttributesCommand({
      QueueUrl: this.queueInfo.url,
      AttributeNames: ['All'],
    })

    return this.client.send(sendGetQueueMessageCommand)
  }
}
