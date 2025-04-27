import { PROCESSING_QUEUE_NAME } from '@lib/shared-config/constants'
import { getProducerToken } from '@modules/sqs'
import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './api.controller'
import { ApiService } from './api.service'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        ApiService,
        { provide: 'AUTH_OPTIONS_TOKEN', useValue: null },
        {
          provide: getProducerToken(PROCESSING_QUEUE_NAME),
          useValue: null,
        },
      ],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('root', () => {
    it('should return "API Running!"', () => {
      expect(appController.health()).toBe('API Running!')
    })
  })
})
