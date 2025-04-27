import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import backgroundProcessingConfig from './configurations/background-processing.configuration'
import cacheConfig from './configurations/cache.configuration'
import delayProcessingConfig from './configurations/delay-processing.configuration'
import sqsConfig from './configurations/sqs.configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      load: [
        cacheConfig,
        sqsConfig,
        backgroundProcessingConfig,
        delayProcessingConfig,
      ],
    }),
  ],
  exports: [ConfigModule],
})
export class SharedConfigModule {}
