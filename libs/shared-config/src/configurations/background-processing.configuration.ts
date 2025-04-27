import { registerAs } from '@nestjs/config'
import { SQS_PROCESSING_QUEUE_TOKEN } from '../constants'

export type SqsQueueConfig = {
  url: string
}

export default registerAs(
  SQS_PROCESSING_QUEUE_TOKEN,
  (): SqsQueueConfig => ({
    url: process.env.BACKGROUND_PROCESSING_SQS_QUEUE_URL,
  }),
)
