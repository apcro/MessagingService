import { CachingService } from '@lib/caching'
import { PROCESSING_QUEUE_NAME } from '@lib/shared-config/constants'
import { SendgridService } from '@modules/sendgrid'
import {
  Message,
  MessageHandler,
  MessageProcessedEvent,
  SqsErrorEvent,
  SqsMessageEntry,
  SqsMessageHandler,
  SqsQueueEvent,
  SqsQueueEventListener,
} from '@modules/sqs'
import { Injectable, Logger } from '@nestjs/common'
import { DelayQueueService } from 'apps/delay/src/delay.queue.service'

@Injectable()
@SqsMessageHandler(PROCESSING_QUEUE_NAME)
export class BackgroundProcessingService extends MessageHandler {
  private readonly logger = new Logger(BackgroundProcessingService.name)

  constructor(
    private readonly cachingService: CachingService,
    private readonly delayQueueService: DelayQueueService,
    private readonly sendgridService: SendgridService,
  ) {
    super()
  }

  async handleMessage(message: Message): Promise<void> {
    if (!message.Body) {
      return
    }
    await this.reallyHandleMessage(message)
  }

  private async reallyHandleMessage(message: Message) {
    const eventConfiguration = await this.validateEvent(message)
    if (eventConfiguration != null) {
      // do we need to send any events on receipt?
      this.onMessageReceived(message, eventConfiguration.onReceived)

      // versioning of the configuration allows for future expansion of schema validation
      switch (eventConfiguration.configVersion) {
        case '1':
        default:
          if (eventConfiguration.delay != 0) {
            const outgoingMessage = message as SqsMessageEntry
            outgoingMessage.MessageBody = message.Body
            this.delayQueueService.send(outgoingMessage)
          }
          // process the message now
          switch (eventConfiguration.type) {
            case 'email':
              this.constructAndSendEmail(message, eventConfiguration)
              break
            case 'push':
              // TODO
              break
            default:
              // throw an error
              this.trackEventError(eventConfiguration)
              break
          }
          break
      }
    } else {
      this.trackEventError(message)
    }
  }

  private async validateEvent(message: Message): Promise<any> {
    const event = JSON.parse(message.Body)
    const key = `eventname:${event.data.eventName}`
    const eventData = await this.cachingService.client.get(key)
    const eventConfiguration = JSON.parse(eventData)

    return eventConfiguration.configuration
  }

  @SqsQueueEventListener(
    PROCESSING_QUEUE_NAME,
    SqsQueueEvent.MESSAGE_RECEIVE_END,
  )
  onReceivingEnd(payload: SqsErrorEvent) {
    this.logger.debug('Event: MESSAGE_RECEIVE_END')
    if (!payload.error) {
      return
    }
  }

  @SqsQueueEventListener(
    PROCESSING_QUEUE_NAME,
    SqsQueueEvent.MESSAGE_PROCESSING_END,
  )
  onMessageProcessingEnd(payload: MessageProcessedEvent) {
    this.logger.debug('Event: MESSAGE_PROCESSING_END')
    if (payload.failed?.length) {
      for (const fail of payload.failed) {
        this.logger.error(
          JSON.stringify({
            type: 'Messaging Service Failed event',
            error: fail.error,
            data: fail.message,
          }),
        )
      }
    }
  }

  @SqsQueueEventListener(PROCESSING_QUEUE_NAME, SqsQueueEvent.ERROR)
  onError(payload: SqsErrorEvent) {
    if (!payload.error) {
      return
    }
  }

  private onMessageReceived(message: Message, events: Array<string>) {
    if (events.length == 0) {
      return
    }
    const body = JSON.parse(message.Body)
    events.forEach((event) => {
      body.eventId = event
      message.Body = JSON.stringify(body)
    })
  }

  private async onMessageComplete(message: Message, events: Array<string>) {
    if (events.length == 0) {
      return
    }
  }

  private async onMessageError(message: Message, events: Array<string>) {
    if (events.length == 0) {
      return
    }
  }

  private async onMessageRetry(message: Message, events: Array<string>) {
    if (events.length == 0) {
      return
    }
  }

  private trackEventError(message: Message) {
    const event = JSON.parse(message.Body)
    this.logger.error(
      `Message failed validation: ${event.type} does not exist in the configuration set`,
    )
  }

  private constructAndSendEmail(data, eventConfiguration): boolean {
    const message = JSON.parse(data.Body).data

    let apiKey = process.env.SENDGRID_API_KEY
    const bucketId = eventConfiguration.bucketId.toUpperCase()
    if (bucketId.length > 0) {
      switch (bucketId) {
        case 'ONBOARDING':
          apiKey = process.env.SENDGRID_API_KEY_ONBOARDING
          break
      }
    }

    // this is a deliberate transformation to allow for further manipulation prior to sending
    const outgoingMessage = {
      to: message.to,
      from: message.from,
      subject: message.subject,
      templateId: eventConfiguration.templateId,
      templateData: message.templateData,
      cc: '',
      bcc: '',
    }

    if (message.cc != null) {
      outgoingMessage.cc = message.cc
    }
    if (message.bcc != null) {
      outgoingMessage.bcc = message.bcc
    }

    this.sendgridService.setApiKey(apiKey)
    const response = this.sendgridService.sendTemplateEmail(
      outgoingMessage.to,
      outgoingMessage.from,
      outgoingMessage.subject,
      outgoingMessage.templateId,
      outgoingMessage.templateData,
    )
    if (response) {
      this.onMessageComplete(message, eventConfiguration.onComplete)
      return true
    } else {
      this.onMessageError(message, eventConfiguration.onError)
      return false
    }
  }
}
