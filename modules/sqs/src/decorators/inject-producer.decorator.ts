import { Inject } from '@nestjs/common'
import { SqsProducerOptions } from '../producer/sqs-producer-options.interface'
import { getProducerToken } from '../util/get-producer-token.util'

/**
 * Injects a SQSProducer instance for a specific SQS queue using the given options.
 * @param options an object containing info about a queue, for example name.
 */
export function InjectProducer(options: SqsProducerOptions) {
  const foundOptions = producerOptions.find((existingOptions) => {
    return existingOptions.queueName === options.queueName
  })

  // To keep it simple we only allow one producer per queue.
  if (!foundOptions) {
    producerOptions.push(options)
  }

  return Inject(getProducerToken(options.queueName))
}

export const producerOptions: SqsProducerOptions[] = []
