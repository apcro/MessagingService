import {
  InvalidMessageBodyError,
  InvalidMessageDelayError,
  MissingGroupIdError,
} from './invalid-message-entry.error'
import {
  SqsBatchMessageEntry,
  SqsMessageEntry,
} from './sqs-message-request.interface'

export class SqsMessageEntryValidator {
  validateMessage(entry: SqsMessageEntry, forFifoQueue: boolean) {
    if (!entry.MessageBody) {
      throw new InvalidMessageBodyError()
    }

    if (forFifoQueue && !entry.MessageGroupId) {
      throw new MissingGroupIdError()
    }

    if (
      entry.DelaySeconds &&
      (entry.DelaySeconds < 0 || entry.DelaySeconds > 900)
    ) {
      throw new InvalidMessageDelayError(entry.DelaySeconds)
    }
  }

  validateBatch(entries: SqsBatchMessageEntry[], forFifoQueue: boolean) {
    entries.forEach((entry) =>
      this.validateMessage(entry.message, forFifoQueue),
    )
  }
}
