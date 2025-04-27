import { registerAs } from '@nestjs/config'
import { SQS_CONFIG_TOKEN } from '../constants'

export type SqsConfig = {
  region: string
  endpoint?: string
}

export default registerAs(
  SQS_CONFIG_TOKEN,
  (): SqsConfig => ({
    region: process.env.AWS_REGION,
    endpoint: process.env.SQS_ENDPOINT,
  }),
)
