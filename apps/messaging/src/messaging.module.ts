import { DelayQueueService } from '@app/delay/delay.queue.service'
import { CachingModule } from '@lib/caching'
import { SqsQueueConfig as BackgroundQueue } from '@lib/shared-config/configurations/background-processing.configuration'
import { SqsQueueConfig as DelayQueue } from '@lib/shared-config/configurations/delay-processing.configuration'
import {
  DELAY_QUEUE_NAME,
  PROCESSING_QUEUE_NAME,
  SQS_CONFIG_TOKEN,
  SQS_DELAY_QUEUE_TOKEN,
  SQS_PROCESSING_QUEUE_TOKEN,
} from '@lib/shared-config/constants'
import { SharedConfigModule } from '@lib/shared-config/shared-config.module'
import { SendgridModule, SendgridService } from '@modules/sendgrid'
import { SqsModule, SqsModuleOptions } from '@modules/sqs'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BackgroundProcessingService } from './background.processing.service'
import { MessagingController } from './messaging.controller'
import { MessagingQueueService } from './messaging.queue.service'
import { MessagingService } from './messaging.service'

@Module({
  imports: [
    SharedConfigModule,
    SqsModule.forRootAsync({
      imports: [SharedConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<SqsModuleOptions>(SQS_CONFIG_TOKEN)
      },
    }),
    SqsModule.registerQueueAsync({
      queueName: PROCESSING_QUEUE_NAME,
      imports: [SharedConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<BackgroundQueue>(SQS_PROCESSING_QUEUE_TOKEN)
      },
    }),
    SqsModule.registerQueueAsync({
      queueName: DELAY_QUEUE_NAME,
      imports: [SharedConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<DelayQueue>(SQS_DELAY_QUEUE_TOKEN)
      },
    }),
    CachingModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        url: process.env.REDIS_URL,
      }),
    }),
    SendgridModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        apikey: process.env.SENDGRID_API_KEY,
      }),
    }),
  ],
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessagingQueueService,
    DelayQueueService,
    BackgroundProcessingService,
    SendgridService,
  ],
  exports: [CachingModule],
})
export class MessagingModule {}
