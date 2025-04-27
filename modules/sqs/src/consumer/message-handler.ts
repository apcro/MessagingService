import { Message } from '@aws-sdk/client-sqs'
import { OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common'
import { SqsConsumer } from './sqs-consumer'

/**
 * A class that handles messages received by a consumer of a specific queue.
 */
export abstract class MessageHandler
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly _consumer: SqsConsumer | undefined
  private readonly startOnAppBootStrap = true

  abstract handleMessage(message: Message): Promise<void>

  start() {
    this._consumer?.start()
  }

  async stop(): Promise<void> {
    if (!this._consumer) {
      return
    }
    return this._consumer.stop()
  }

  async onModuleDestroy() {
    await this.stop()
  }

  async onApplicationBootstrap() {
    if (this.startOnAppBootStrap) {
      this.start()
    }
  }
}
