import { registerAs } from '@nestjs/config'
import { SQS_DELAY_QUEUE_TOKEN } from '../constants'

export type SqsQueueConfig = {
  url: string
}

export default registerAs(
  SQS_DELAY_QUEUE_TOKEN,
  (): SqsQueueConfig => ({
    url: process.env.DELAY_PROCESSING_SQS_QUEUE_URL,
  }),
)
