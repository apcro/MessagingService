import { ModuleMetadata, Provider, Type } from '@nestjs/common'

export interface CacheModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<CacheModuleOptionsFactory>
  useClass?: Type<CacheModuleOptionsFactory>
  useFactory?: (
    ...args: any[]
  ) => Promise<CacheModuleOptions> | CacheModuleOptions
  inject?: any[]
  extraProviders?: Provider[]
}

export interface CacheModuleOptionsFactory {
  createOptions(): Promise<CacheModuleOptions> | CacheModuleOptions
}

export interface CacheModuleOptions {
  url: string
  cacheType?: string
}
