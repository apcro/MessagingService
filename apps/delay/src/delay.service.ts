import { Injectable } from '@nestjs/common'

@Injectable()
export class DelayService {
  health(): string {
    return 'Delay Running!'
  }
}
