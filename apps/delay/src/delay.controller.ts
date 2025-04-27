import { Controller, Get } from '@nestjs/common'
import { DelayService } from './delay.service'

@Controller()
export class DelayController {
  constructor(private readonly delayService: DelayService) {}

  @Get()
  health(): string {
    return this.delayService.health()
  }
}
