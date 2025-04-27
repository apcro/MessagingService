import { CloudEventData, EventVersion } from '@lib/events/types'
import { PROCESSING_QUEUE_NAME } from '@lib/shared-config/constants'
import {
  InjectProducer,
  SendMessageCommandOutput,
  SqsProducer,
} from '@modules/sqs'
import { Injectable, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'

@Injectable()
export class MessagingService {
  private logger = new Logger(MessagingService.name)

  // this is used only for testing
  private templateData: JSON = <JSON>(<unknown>{
    shared: {
      email: {
        greetings: {
          user: 'Hello,',
        },
      },
    },
  })

  constructor(
    @InjectProducer({ queueName: PROCESSING_QUEUE_NAME })
    private readonly producer: SqsProducer,
  ) {}

  health(): string {
    return 'Messaging Running!'
  }

  async produceRandomMessage(): Promise<SendMessageCommandOutput> {
    const messageId = Math.floor(Math.random() * 3) + 3
    const messageData = {}
    messageData['eventName'] = `EVENT_${messageId}`
    messageData['templateData'] = this.templateData
    messageData['to'] = 'user@example.com'
    messageData['from'] = 'no-reply@example.com'
    messageData['subject'] = 'test template send'

    const dummyMessage: CloudEventData = new CloudEventData()
    dummyMessage.id = randomUUID()
    dummyMessage.origin = 'messaging-service-test'
    dummyMessage.version = EventVersion.V1
    dummyMessage.type = 'message'
    dummyMessage.created_at = new Date().toISOString()

    const result = await this.producer.send({
      MessageBody: JSON.stringify(dummyMessage),
    })
    return result
  }

  async sendTestTemplateEmail() {
    const messageData = {}
    messageData['templateData'] = this.templateData
    messageData['to'] = 'test@example.com'
    messageData['from'] = 'no-reply@example.com'
    messageData['subject'] = 'test template send'
    messageData['eventName'] = 'EVENT_01'

    const dummyMessage: CloudEventData = new CloudEventData()
    dummyMessage.id = randomUUID()
    dummyMessage.origin = 'messaging-service-sendgrid-test'
    dummyMessage.version = EventVersion.V1
    dummyMessage.type = 'message'
    dummyMessage.created_at = new Date().toISOString()
    dummyMessage.data = messageData

    this.logger.debug(
      'Sending Test Sendgrid Message',
      JSON.stringify(dummyMessage),
    )
    const result = await this.producer.send({
      MessageBody: JSON.stringify(dummyMessage),
    })
    return result
  }
}
