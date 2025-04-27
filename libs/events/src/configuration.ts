import { registerAs } from '@nestjs/config'
import { EVENTS_CONFIG_KEY } from './constants'
import { EventConfig } from './types'

export default registerAs(
  EVENTS_CONFIG_KEY,
  (): EventConfig => ({
    enabled: process.env.NODE_ENV === 'development' ? false : true,
    sendMessagingEventHost: process.env.SEND_MESSAGING_EVENT_HOST,
  }),
)
