import { SqsProducer } from '@modules/sqs'
import { Test, TestingModule } from '@nestjs/testing'
import { MessagingController } from './messaging.controller'
import { MessagingService } from './messaging.service'

describe('MessagingController', () => {
  let messagingController: MessagingController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MessagingController],
      providers: [MessagingService, { provide: SqsProducer, useValue: {} }],
    }).compile()

    messagingController = app.get<MessagingController>(MessagingController)
  })

  describe('root', () => {
    it('should return "Messaging Running!"', () => {
      expect(messagingController.health()).toBe('Messaging Running!')
    })
  })
})
