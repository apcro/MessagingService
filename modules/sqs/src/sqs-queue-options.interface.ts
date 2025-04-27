import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common'

/**
 * Options used to setup the module for use with a specific sqs queue.
 */
export interface SqsQueueOptions {
  /**
   * The name of the queue in AWS.
   */
  name: string

  /**
   * The url of the queue. When not provided the library will try to
   * Fetch the url from Amazon.
   */
  url?: string
}

export type FactoryReturnValue =
  | Promise<SqsQueueOptions>
  | Omit<SqsQueueOptions, 'name'>

export interface SharedSqsQueueOptionsFactory {
  createOptions(): FactoryReturnValue
}

export interface SqsQueueAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * The name of the queue in AWS.
   */
  queueName: string

  /**
   * Existing queue options factory instance (exported by another module) to be used.
   */
  useExisting?: Type<SharedSqsQueueOptionsFactory>

  /**
   *  /**
   * Type (class name) of the queue options factory to be registered and injected.
   */
  useClass?: Type<SharedSqsQueueOptionsFactory>

  /**
   * A factory function used to provide the queue options.
   */
  useFactory?: (...args: any[]) => FactoryReturnValue

  /**
   * an optional list of providers to be injected into the context of the factory function.
   */
  inject?: FactoryProvider['inject']
}
