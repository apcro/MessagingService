import { CloudEventData } from '@lib/events/types'
import { Body, Controller, Get, HttpCode, Logger, Post } from '@nestjs/common'
import { ApiService } from './api.service'

@Controller()
export class AppController {
  private logger = new Logger(AppController.name)
  constructor(private readonly appService: ApiService) {}

  @Get()
  health(): string {
    return this.appService.health()
  }

  @Post('event')
  @HttpCode(200)
  async Event(@Body() payload: CloudEventData): Promise<void> {
    this.logger.debug('Event received', payload)
    this.appService.handleWebhook(payload)
  }
}
