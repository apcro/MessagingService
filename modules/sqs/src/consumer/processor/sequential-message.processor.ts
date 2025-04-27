import { Message } from '@aws-sdk/client-sqs'
import { SqsMessageError } from '../sqs.message.error'
import {
  BaseMessageProcessor,
  SqsMessageProcessorResult,
} from './sqs-message-processor.interface'

/**
 * A message processor that processes each message in a batch sequentially.
 */
export class SequentialMessageProcessor extends BaseMessageProcessor {
  async process(
    messages: Message[],
    handleMessageTimeout?: number | undefined,
  ): Promise<SqsMessageProcessorResult> {
    const success: Message[] = []
    const failed: SqsMessageError[] = []

    for (const message of messages) {
      try {
        const resultMessage = await this.executeHandler(
          message,
          handleMessageTimeout,
        )
        success.push(resultMessage)
      } catch (error) {
        failed.push(error as SqsMessageError)
      }
    }
    return { success: success, failed: failed }
  }
}
