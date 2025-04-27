import { SQSClientConfig } from '@aws-sdk/client-sqs'
import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common'

/**
 * Options used to configure the SQS module. Use this when you need to customize the
 * underlying SQS client.
 */
export type SqsModuleOptions = SQSClientConfig

export interface SharedSqsModuleOptionsFactory {
  createOptions(): Promise<SqsModuleOptions> | SqsModuleOptions
}

export interface SqsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing options factory instance (exported by another module) to be used.
   */
  useExisting?: Type<SharedSqsModuleOptionsFactory>

  /**
   * Type (class name) of the options factory to be registered and injected.
   */
  useClass?: Type<SharedSqsModuleOptionsFactory>

  /**
   * A factory function responsible for creating the module options.
   */
  useFactory?: (...args: any[]) => Promise<SqsModuleOptions> | SqsModuleOptions

  /**
   * an optional list of providers to be injected into the context of the factory function.
   */
  inject?: FactoryProvider['inject']
}
