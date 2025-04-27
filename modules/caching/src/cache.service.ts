import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { CACHE_CONFIG_OPTIONS } from './constants'
import { CacheModuleOptions } from './types'

@Injectable()
export class CacheService {
  client?: Redis | Cache

  constructor(
    @Inject(CACHE_CONFIG_OPTIONS) { cacheType, url }: CacheModuleOptions,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    switch (cacheType) {
      case 'memory':
        this.client = this.cacheManager
        break
      case 'redis':
      default:
        this.client = new Redis(url)
        break
    }
  }
}
