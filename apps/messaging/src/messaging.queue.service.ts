import { PROCESSING_QUEUE_NAME } from '@lib/shared-config/constants'
import { InjectProducer, SqsProducer } from '@modules/sqs'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MessagingQueueService {
  constructor(
    @InjectProducer({ queueName: PROCESSING_QUEUE_NAME, batchSize: 10 })
    private readonly producer: SqsProducer,
  ) {}
}
