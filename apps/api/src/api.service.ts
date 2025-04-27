import { CloudEventData } from '@lib/events/types'
import { PROCESSING_QUEUE_NAME } from '@lib/shared-config/constants'
import { InjectProducer, SqsProducer } from '@modules/sqs'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class ApiService {
  private logger = new Logger(ApiService.name)

  constructor(
    @InjectProducer({ queueName: PROCESSING_QUEUE_NAME })
    private readonly producer: SqsProducer,
  ) {}

  health(): string {
    return 'API Running!'
  }

  public async handleWebhook(payload: CloudEventData) {
    try {
      this.logger.debug('Sending message to queue')
      await this.producer.send({
        DelaySeconds: 0,
        MessageBody: JSON.stringify(payload),
      })
    } catch (error) {
      this.logger.error('There was an error', error)
    }
  }
}
