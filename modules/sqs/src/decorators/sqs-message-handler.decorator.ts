import { SetMetadata } from '@nestjs/common'
import { SqsConsumerOptions } from '../consumer/sqs-consumer-options.interface'
import { SQS_MESSAGE_HANDLER } from '../sqs.constants'

export type SqsMessageHandlerMetadata = {
  queueName: string
  options?: SqsConsumerOptions
}

/**
 * Registers a class that is capable of processing message from a SQS queue with the given name.
 * It is required that the class extends the abstract `MessageHandler` class.
 * @param queueName the name of the SQS queue.
 * @param options options for configuring the underlying consumer.
 */
export function SqsMessageHandler(
  queueName: string,
  options?: SqsConsumerOptions,
): ClassDecorator {
  return SetMetadata(SQS_MESSAGE_HANDLER, {
    queueName,
    options: options,
  } as SqsMessageHandlerMetadata)
}
