import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { CONFIG_OPTIONS } from './constants'
import { ConfigOptions } from './types'

@Injectable()
export class CachingService {
  client: Redis

  constructor(@Inject(CONFIG_OPTIONS) { url }: ConfigOptions) {
    this.client = new Redis(url)
  }
}
