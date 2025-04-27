import { Message } from '@aws-sdk/client-sqs'

/**
 * An error thrown when something has failed with processing a message.
 */
export class SqsMessageError {
  constructor(readonly error: unknown, readonly message: Message) {}
}
