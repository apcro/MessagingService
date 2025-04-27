import { Provider } from '@nestjs/common'
import { producerOptions } from './decorators/inject-producer.decorator'
import { SqsProducer } from './producer/sqs-producer'
import { SqsProducerOptions } from './producer/sqs-producer-options.interface'
import { SqsClientService } from './sqs-client.service'
import { getProducerToken } from './util/get-producer-token.util'

async function producerFactory(
  sqsService: SqsClientService,
  options: SqsProducerOptions,
) {
  const queueInfo = await sqsService.getInfoForQueue(options.queueName)
  return new SqsProducer(queueInfo, sqsService.client, options.batchSize ?? 1)
}

function createProducerProvider(
  options: SqsProducerOptions,
): Provider<SqsProducer> {
  return {
    provide: getProducerToken(options.queueName),
    useFactory: async (clientService) =>
      producerFactory(clientService, options),
    inject: [SqsClientService],
  }
}

export function createProducerProviders(): Array<Provider<SqsProducer>> {
  return producerOptions.map((options) => createProducerProvider(options))
}
