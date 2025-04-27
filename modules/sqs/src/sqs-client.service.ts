import { GetQueueUrlCommand, SQSClient } from '@aws-sdk/client-sqs'
import { DiscoveryService } from '@golevelup/nestjs-discovery'
import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MessageHandler } from './consumer/message-handler'
import { SqsConsumer } from './consumer/sqs-consumer'
import { SqsMessageHandlerMetadata } from './decorators/sqs-message-handler.decorator'
import { SqsModuleOptions } from './sqs-module-options.interface'
import { SqsQueueInfo } from './sqs-queue-info'
import { SqsQueueOptions } from './sqs-queue-options.interface'
import { SQS_MESSAGE_HANDLER, SQS_MODULE_OPTIONS } from './sqs.constants'
import { getQueueOptionsToken } from './util/get-queue-options-token.utils'

@Injectable()
export class SqsClientService implements OnModuleInit, OnApplicationShutdown {
  readonly client: SQSClient
  readonly messageHandlers = new Map<string, MessageHandler>()
  private queueInfos: SqsQueueInfo[] = []

  constructor(
    @Inject(SQS_MODULE_OPTIONS) options: SqsModuleOptions,
    private readonly discover: DiscoveryService,
    private readonly eventEmitter: EventEmitter2,
    private readonly moduleRef: ModuleRef,
  ) {
    this.client = new SQSClient(options)
  }

  async onModuleInit() {
    const discoveredClasses =
      await this.discover.providersWithMetaAtKey<SqsMessageHandlerMetadata>(
        SQS_MESSAGE_HANDLER,
      )

    for (const discoveredClass of discoveredClasses) {
      const { queueName, options } = discoveredClass.meta
      const messageHandler = discoveredClass.discoveredClass
        .instance as MessageHandler

      if (!(messageHandler instanceof MessageHandler)) {
        throw Error(
          `Class ("${discoveredClass.discoveredClass.name}") should inherit from the abstract "ConsumerHost" class.`,
        )
      }

      // Ensure the queue only has one consumer and one message handler.
      // As the consumer continuously needs to poll, it doesn't make sense to have
      // more then one consumer for the same queue.
      if (this.messageHandlers.get(queueName) != undefined) {
        throw Error(`Host for ${queueName} already exists`)
      }

      const queueInfo = await this.getInfoForQueue(queueName)

      const consumer = new SqsConsumer(
        queueInfo,
        this.client,
        this.eventEmitter,
        messageHandler.handleMessage.bind(messageHandler),
        options,
      )

      /* eslint-disable */
      (messageHandler as any)._consumer = consumer
      (messageHandler as any).startOnAppBootStrap =
        options?.startOnApplicationBootstrap ?? true
      /* eslint-enable */
      this.messageHandlers.set(queueName, messageHandler)
    }
  }

  async onApplicationShutdown() {
    // Explicitly shutdown the agent as it is no longer needed anymore.
    this.client.destroy()
  }

  async getInfoForQueue(queueName: string): Promise<SqsQueueInfo> {
    const existingQueueInfo = this.queueInfos.find((queueInfo) => {
      return queueInfo.name == queueName
    })

    if (existingQueueInfo) {
      return existingQueueInfo
    }

    const queueOptions = this.moduleRef.get(getQueueOptionsToken(queueName), {
      strict: false,
    }) as SqsQueueOptions

    if (queueOptions.url) {
      const queueInfo = new SqsQueueInfo(queueName, queueOptions.url)
      this.queueInfos.push(queueInfo)
      return queueInfo
    }

    const getQueueUrlCommand = new GetQueueUrlCommand({ QueueName: queueName })
    const data = await this.client.send(getQueueUrlCommand)

    if (!data.QueueUrl) {
      throw Error(`SQS queue ${queueName} doesn't exist`)
    }

    const queueInfo = new SqsQueueInfo(queueName, data.QueueUrl)
    this.queueInfos.push(queueInfo)
    return queueInfo
  }
}
