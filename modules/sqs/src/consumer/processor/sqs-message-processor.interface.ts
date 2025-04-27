import { Message } from '@aws-sdk/client-sqs'
import { createTimeout, TimeoutResponse } from '../../util/timeout.util'
import { SqsMessageError } from '../sqs.message.error'

export interface SqsMessageProcessorResult {
  success: Message[]
  failed: SqsMessageError[]
}

export interface SqsMessageProcessor {
  /**
   * This method will process messages that a consumer received from its SQS queue.
   * @param messages the messages to process.
   * @param handleMessageTimeout the interval within processing of a single message should timeout
   * @interface
   */
  process(
    messages: Message[],
    handleMessageTimeout?: number,
  ): Promise<SqsMessageProcessorResult>
}

/**
 * @implememts SqsMessageProcessor
 */
export abstract class BaseMessageProcessor implements SqsMessageProcessor {
  constructor(
    private readonly handleMessage: (message: Message) => Promise<void>,
  ) {}

  abstract process(
    messages: Message[],
    handleMessageTimeout?: number,
  ): Promise<SqsMessageProcessorResult>

  protected async executeHandler(
    message: Message,
    handleMessageTimeout?: number,
  ): Promise<Message> {
    let timeoutResponse: TimeoutResponse | undefined
    try {
      if (handleMessageTimeout != undefined) {
        // Reject the promise if processing doesn't finish within the timeout interval.
        timeoutResponse = createTimeout(handleMessageTimeout, 'Handle message')
        await Promise.race([
          this.handleMessage(message),
          timeoutResponse.pending,
        ])
        return message
      } else {
        await this.handleMessage(message)
        return message
      }
    } catch (error) {
      throw new SqsMessageError(error, message)
    } finally {
      if (timeoutResponse) {
        clearTimeout(timeoutResponse.timeout)
      }
    }
  }
}
