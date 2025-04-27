import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { SendgridModule } from './sendgrid.module'
import { SendgridService } from './sendgrid.service'

describe('SendgridModule', () => {
  describe('default implementation', () => {
    let sendgridService: SendgridService

    beforeEach(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule,
          SendgridModule.registerAsync({
            useFactory: () => ({
              apikey: 'SG.FAKE_API_KEY',
            }),
          }),
        ],
      }).compile()

      sendgridService = await moduleRef.resolve<SendgridService>(
        SendgridService,
      )
    })

    it('injects the sendgrid service', async () => {
      expect(sendgridService).toBeDefined()
    })

    it('should send a plain email', async () => {
      const app = await Test.createTestingModule({
        imports: [
          ConfigModule,
          SendgridModule.registerAsync({
            useFactory: () => ({
              apikey: 'SG.FAKE_API_KEY',
            }),
          }),
        ],
        providers: [SendgridService],
      }).compile()
      const service = app.get<SendgridService>(SendgridService)
      const mock = jest
        .spyOn(service, 'send')
        .mockImplementationOnce(async () => {
          return [{} as any, {}]
        })
      await service.send({
        to: 'test@example.com',
        from: 'test@example.com',
        subject: 'Sending with SendGrid is Fun',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      })
      expect(mock).toHaveBeenCalled()
    })

    it('should send an HTML email', async () => {
      const app = await Test.createTestingModule({
        imports: [
          ConfigModule,
          SendgridModule.registerAsync({
            useFactory: () => ({
              apikey: 'SG.FAKE_API_KEY',
            }),
          }),
        ],
        providers: [SendgridService],
      }).compile()
      const service = app.get<SendgridService>(SendgridService)
      const mock = jest
        .spyOn(service, 'sendHTMLEmail')
        .mockImplementationOnce(async () => {
          return [{} as any, {}]
        })
      await service.sendHTMLEmail(
        'test@example.com',
        'test@example.com',
        'Sending with SendGrid is Fun',
        '<strong>and easy to do anywhere, even with Node.js</strong>',
      )
      expect(mock).toHaveBeenCalled()
    })

    it('should send a Template email', async () => {
      const app = await Test.createTestingModule({
        imports: [
          ConfigModule,
          SendgridModule.registerAsync({
            useFactory: () => ({
              apikey: 'SG.FAKE_API_KEY',
            }),
          }),
        ],
        providers: [SendgridService],
      }).compile()
      const service = app.get<SendgridService>(SendgridService)
      const mock = jest
        .spyOn(service, 'sendTemplateEmail')
        .mockImplementationOnce(async () => {
          return [{} as any, {}]
        })
      await service.sendTemplateEmail(
        'test@example.com',
        'test@example.com',
        'Sending with SendGrid is Fun',
        'template_id',
        {} as JSON,
      )
      expect(mock).toHaveBeenCalled()
    })
  })
})
