import { Controller, Get } from '@nestjs/common'
import { MessagingService } from './messaging.service'

@Controller()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  health(): string {
    return this.messagingService.health()
  }
}
