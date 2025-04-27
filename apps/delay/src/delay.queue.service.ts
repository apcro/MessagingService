import { DELAY_QUEUE_NAME } from '@lib/shared-config/constants'
import {
  InjectProducer,
  SendMessageCommandOutput,
  SqsMessageEntry,
  SqsProducer as DelayProducer,
} from '@modules/sqs'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class DelayQueueService {
  private readonly logger = new Logger(DelayQueueService.name)

  constructor(
    @InjectProducer({ queueName: DELAY_QUEUE_NAME, batchSize: 10 })
    private readonly delayProducer: DelayProducer,
  ) {}

  async send(message: SqsMessageEntry): Promise<SendMessageCommandOutput> {
    try {
      const result = await this.delayProducer.send(message)
      return result
    } catch (error) {
      this.logger.debug(error)
    }
  }
}
