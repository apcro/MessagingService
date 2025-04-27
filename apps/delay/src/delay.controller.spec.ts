import { Test, TestingModule } from '@nestjs/testing'
import { DelayController } from './delay.controller'
import { DelayService } from './delay.service'

describe('DelayController', () => {
  let delayController: DelayController

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DelayController],
      providers: [DelayService],
    }).compile()

    delayController = app.get<DelayController>(DelayController)
  })

  describe('root', () => {
    it('should return "Delay Running!"', () => {
      expect(delayController.health()).toBe('Delay Running!')
    })
  })
})
