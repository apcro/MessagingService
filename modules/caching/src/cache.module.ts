import { CacheModule as NestCache } from '@nestjs/cache-manager'
import { DynamicModule, Provider } from '@nestjs/common'
import { CacheService } from './cache.service'
import { CACHE_CONFIG_OPTIONS } from './constants'
import { CacheModuleAsyncOptions, CacheModuleOptionsFactory } from './types'

export class CacheModule {
  static registerAsync(options: CacheModuleAsyncOptions): DynamicModule {
    return {
      module: CacheModule,
      imports: [...(options.imports || []), NestCache.register()],
      providers: [...this.createAsyncProviders(options), CacheService],
      exports: [CacheService],
    }
  }

  private static createAsyncProviders(
    options: CacheModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    return [
      this.createAsyncOptionsProvider(options),
      ...(options.useClass
        ? [
            {
              provide: options.useClass,
              useClass: options.useClass,
            },
          ]
        : []),
    ]
  }

  private static createAsyncOptionsProvider(
    options: CacheModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: CACHE_CONFIG_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }
    return {
      provide: CACHE_CONFIG_OPTIONS,
      useFactory: async (optionsFactory: CacheModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject: [
        ...(options.useExisting ? [options.useExisting] : []),
        ...(options.useClass ? [options.useClass] : []),
      ],
    }
  }
}
