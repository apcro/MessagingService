import { BatchResultErrorEntry } from '@aws-sdk/client-sqs'
import { BaseError } from '../util/base.error'

/**
 * An error containing containing information about the failure of a
 * message delete request.
 */
export class SqsMessageDeleteError extends BaseError {
  constructor(readonly entry: BatchResultErrorEntry) {
    super(`${entry.Code} - ${entry.Message}`)
  }
}
