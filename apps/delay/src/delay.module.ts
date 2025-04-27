import { CachingModule } from '@lib/caching'
import { SqsQueueConfig } from '@lib/shared-config/configurations/delay-processing.configuration'
import {
  DELAY_QUEUE_NAME,
  SQS_CONFIG_TOKEN,
  SQS_DELAY_QUEUE_TOKEN,
} from '@lib/shared-config/constants'
import { SharedConfigModule } from '@lib/shared-config/shared-config.module'
import { SqsModule, SqsModuleOptions } from '@modules/sqs'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BackgroundProcessingService } from './background.processing.service'
import { CassandraModule } from './cassandra/cassandra.module'
import { DelayController } from './delay.controller'
import { DelayQueueService } from './delay.queue.service'
import { DelayService } from './delay.service'

@Module({
  imports: [
    CassandraModule,
    SharedConfigModule,
    SqsModule.forRootAsync({
      imports: [SharedConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<SqsModuleOptions>(SQS_CONFIG_TOKEN)
      },
    }),
    SqsModule.registerQueueAsync({
      queueName: DELAY_QUEUE_NAME,
      imports: [SharedConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<SqsQueueConfig>(SQS_DELAY_QUEUE_TOKEN)
      },
    }),
    CachingModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        url: process.env.REDIS_URL,
      }),
    }),
  ],
  controllers: [DelayController],
  providers: [DelayService, BackgroundProcessingService, DelayQueueService],
  exports: [CachingModule],
})
export class DelayModule {}
