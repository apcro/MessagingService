import { CachingModule } from '@lib/caching'
import { SqsQueueConfig as BackgroundQueue } from '@lib/shared-config/configurations/background-processing.configuration'
import {
  PROCESSING_QUEUE_NAME,
  SQS_CONFIG_TOKEN,
  SQS_PROCESSING_QUEUE_TOKEN,
} from '@lib/shared-config/constants'
import { SharedConfigModule } from '@lib/shared-config/shared-config.module'
import { SqsModule, SqsModuleOptions } from '@modules/sqs'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AppController } from './api.controller'
import { ApiService } from './api.service'

@Module({
  imports: [
    SharedConfigModule,
    CachingModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        url: process.env.REDIS_URL,
      }),
    }),
    SqsModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<SqsModuleOptions>(SQS_CONFIG_TOKEN)
      },
    }),
    SqsModule.registerQueueAsync({
      queueName: PROCESSING_QUEUE_NAME,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<BackgroundQueue>(SQS_PROCESSING_QUEUE_TOKEN)
      },
    }),
  ],
  controllers: [AppController],
  providers: [ApiService],
})
export class AppModule {}
