import { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs'
import { mapMessageToBatchEntry } from '../util/batch-entry.util'
import { sizeOfMessage } from '../util/message-size.util'
import { SqsBatchMessageEntry } from './sqs-message-request.interface'

export interface MessageBatcherResult {
  batches: SendMessageBatchRequestEntry[][]
  failedEntries: SqsBatchMessageEntry[]
}

export class SqsMessageBatcher {
  constructor(
    private readonly maxBatchLength: number,
    private readonly maxBatchSize: number,
  ) {}

  /**
   * Packs a large list of message entries into batches of `maxBatchSize` entries or less.
   * The sum of the entries lengths will be below the 256 KB (262,144 bytes) limit enforced by AWS.
   **/
  packMessagesIntoBatches(
    batchMessageEntries: SqsBatchMessageEntry[],
  ): MessageBatcherResult {
    const batches: SendMessageBatchRequestEntry[][] = []
    const failedEntries: SqsBatchMessageEntry[] = []
    let currentBatch: SendMessageBatchRequestEntry[] = []
    let currentBatchSize = 0

    // In terms of packing the messages in as less batches as possible,
    // it would be more efficient to first sort the entries on size.
    // However, for now were more concerned about preserving the order of messages.
    batchMessageEntries.forEach((batchMessageEntry) => {
      const currentMessageSize = sizeOfMessage(batchMessageEntry.message)

      if (currentMessageSize > this.maxBatchSize) {
        failedEntries.push(batchMessageEntry)
        return
      } else if (
        currentBatch.length === this.maxBatchLength ||
        currentBatchSize + currentMessageSize >= this.maxBatchSize
      ) {
        // We've reached the end of the batch.
        batches.push(currentBatch)
        currentBatch = []
        currentBatchSize = 0
      }

      // Append the item to the current batch.
      currentBatchSize += currentMessageSize
      const batchRequestEntry = mapMessageToBatchEntry(batchMessageEntry)
      currentBatch.push(batchRequestEntry)
    })

    if (currentBatch.length) {
      // Finish the last batch.
      batches.push(currentBatch)
    }

    return {
      batches: batches,
      failedEntries: failedEntries,
    }
  }
}
