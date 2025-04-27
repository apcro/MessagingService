import { DELAY_QUEUE_NAME } from '@lib/shared-config/constants'
import { InjectProducer, SqsProducer as DelayProducer } from '@modules/sqs'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class BackgroundProcessingService {
  private readonly logger = new Logger(BackgroundProcessingService.name)
  constructor(
    @InjectProducer({ queueName: DELAY_QUEUE_NAME, batchSize: 10 })
    private readonly delayProducer: DelayProducer,
  ) {}

  async getQueueCount() {
    const queueResult = await this.delayProducer.getQueueAttributes()
    this.logger.debug(queueResult)
    return +queueResult.Attributes['ApproximateNumberOfMessages']
  }
}
