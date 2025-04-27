import {
  ConfigurableModuleBuilder,
  DynamicModule,
  Module,
} from '@nestjs/common'
import { CachingService } from './caching.service'
import { CONFIG_OPTIONS } from './constants'
import { ConfigOptions } from './types'

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ConfigOptions>().build()

@Module({})
export class CachingModule extends ConfigurableModuleClass {
  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    return {
      ...super.registerAsync(options),
      exports: [CachingService],
      providers: [
        CachingService,
        {
          provide: CONFIG_OPTIONS,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
    }
  }
}
