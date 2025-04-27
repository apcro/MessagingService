import { DiscoveryModule } from '@golevelup/nestjs-discovery'
import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { SqsClientService } from './sqs-client.service'
import {
  SharedSqsModuleOptionsFactory,
  SqsModuleAsyncOptions,
  SqsModuleOptions,
} from './sqs-module-options.interface'
import {
  SharedSqsQueueOptionsFactory,
  SqsQueueAsyncOptions,
  SqsQueueOptions,
} from './sqs-queue-options.interface'
import { SQS_MODULE_OPTIONS } from './sqs.constants'
import { createProducerProviders } from './sqs.providers'
import { getQueueOptionsToken } from './util/get-queue-options-token.utils'

@Global()
@Module({
  imports: [
    DiscoveryModule,
    EventEmitterModule.forRoot({ wildcard: true, ignoreErrors: true }),
  ],
})
export class SqsModule {
  /**
   * Registers the global SQS module synchronously. This will create a SQS client
   * that is shared across all producers and consumers in the app.
   * @param options the configuration options for SQS.
   */
  static forRoot(options: SqsModuleOptions): DynamicModule {
    const providers = [SqsClientService]

    return {
      module: SqsModule,
      providers: [
        {
          provide: SQS_MODULE_OPTIONS,
          useValue: options,
        },
        ...providers,
      ],
      exports: providers,
    }
  }

  /**
   * Configure the global SQS module asynchronously. This will create a SQS client that is
   * shared across all producers and consumers in the app. You typically use this method
   * when you need to load in the module options from a configuration file.
   * @param options method for dynamically supplying the SQS module options.
   */
  static forRootAsync(options: SqsModuleAsyncOptions): DynamicModule {
    const optionsProvider = this.createAsyncSharedOptionsProviders(options)
    const providers = [SqsClientService]

    return {
      module: SqsModule,
      imports: options.imports,
      providers: [...optionsProvider, ...providers],
      exports: providers,
    }
  }

  /**
   * Synchronously sets up the module for use with a specific sqs queue.
   * It will inject producers injected by the `@InjectProducer` decorator and a consumer when
   * your app contains a message handler.
   * @param options options that contain information about the queue.
   */
  static registerQueue(options: SqsQueueOptions): DynamicModule {
    const producerProviders = createProducerProviders()

    return {
      module: SqsModule,
      providers: [
        {
          provide: getQueueOptionsToken(options.name),
          useValue: options,
        },
        ...producerProviders,
      ],
      exports: [...producerProviders],
    }
  }

  /**
   * Asynchronously sets up the module for use with a specific SQS queue.
   * It will inject producers injected by the `@InjectProducer` decorator and a consumer when
   * your app contains a message handler.
   * @param options the options that contain information about the queue
   */
  static registerQueueAsync(options: SqsQueueAsyncOptions): DynamicModule {
    const producerProviders = createProducerProviders()
    const asyncOptionsProvider = this.createAsyncQueueOptionsProvider(options)

    return {
      imports: options.imports,
      module: SqsModule,
      providers: [...producerProviders, ...asyncOptionsProvider],
      exports: producerProviders,
    }
  }

  private static createAsyncSharedOptionsProviders(
    options: SqsModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    const useClass = options.useClass as Type<SharedSqsModuleOptionsFactory>

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ]
  }

  private static createAsyncOptionsProvider(
    options: SqsModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: SQS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<SharedSqsModuleOptionsFactory>,
    ]

    return {
      provide: SQS_MODULE_OPTIONS,
      useFactory: async (optionsFactory: SharedSqsModuleOptionsFactory) =>
        optionsFactory.createOptions(),
      inject,
    }
  }

  private static createAsyncQueueOptionsProvider(
    options: SqsQueueAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: getQueueOptionsToken(options.queueName),
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ]
    }

    const useClass = options.useClass as Type<SharedSqsQueueOptionsFactory>
    const useExisting =
      options.useExisting as Type<SharedSqsQueueOptionsFactory>
    const inject = [useClass ?? useExisting]
    const additionalProvider = useClass
      ? [
          {
            provide: useClass,
            useValue: useClass,
          },
        ]
      : []

    return [
      {
        provide: getQueueOptionsToken(options.queueName),
        useFactory: async (optionsFactory: SharedSqsQueueOptionsFactory) =>
          optionsFactory.createOptions(),
        inject,
      },
      ...additionalProvider,
    ]
  }
}
