import {
  BatchResultErrorEntry,
  SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs'
import { MessageEntrySizeLimitError } from '../producer/MessageEntrySizeLimit.error'
import { SqsBatchMessageEntry } from '../producer/sqs-message-request.interface'

export function mapMessageToBatchEntry(
  message: SqsBatchMessageEntry,
): SendMessageBatchRequestEntry {
  return {
    Id: message.id,
    ...message.message,
  }
}

export function mapMessageToBatchErrorEntry(
  message: SqsBatchMessageEntry,
): BatchResultErrorEntry {
  return {
    Id: message.id,
    SenderFault: true,
    Code: `${MessageEntrySizeLimitError.name}`,
    Message: `${message} exceeds 256 KB size limit"`,
  }
}
