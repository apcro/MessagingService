import { BaseError } from '../util/base.error'

/**
 * An error indicating that the module wasn't able to construct a `SqsProducer` because it
 * received an invalid option through the `@InjectProducer()` decorator.
 */
export class InvalidProducerOptionError extends BaseError {
  constructor(batchSize: number) {
    super(
      `Invalid batch size ${batchSize}: the SQS producer batch size should be between 0 and 10`,
    )
  }
}
