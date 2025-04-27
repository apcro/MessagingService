import { CacheModuleOptions } from '@modules/caching/types'
import { registerAs } from '@nestjs/config'

import { CACHE_CONFIG_TOKEN } from '../constants'

export default registerAs(
  CACHE_CONFIG_TOKEN,
  (): CacheModuleOptions => ({
    url: process.env.REDIS_URL,
  }),
)
