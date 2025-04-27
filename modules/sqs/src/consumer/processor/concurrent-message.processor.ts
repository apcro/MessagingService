import { Message } from '@aws-sdk/client-sqs'
import { SqsMessageError } from '../sqs.message.error'
import {
  BaseMessageProcessor,
  SqsMessageProcessorResult,
} from './sqs-message-processor.interface'

/**
 * A message processor that will process the messages received by a consumer concurrently.
 * When message processing contains asynchronous work, such as network request or other I/O, this
 * can improve performance. When the message is CPU bound, this will make less of a difference.
 */
export class ConcurrentMessageProcessor extends BaseMessageProcessor {
  async process(
    messages: Message[],
    handleMessageTimeout?: number,
  ): Promise<SqsMessageProcessorResult> {
    const promises = messages.map(message => {
      return this.executeHandler(message, handleMessageTimeout)
    })
    const result = await Promise.allSettled(promises)

    const success: Message[] = []
    const failed: SqsMessageError[] = []

    result.forEach((result) => {
      if (result.status == 'fulfilled') {
        success.push(result.value)
      } else if (
        result.status == 'rejected' &&
        result.reason instanceof SqsMessageError
      ) {
        failed.push(result.reason)
      }
    })

    return { success: success, failed: failed }
  }
}
