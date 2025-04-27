import { Injectable } from '@nestjs/common'
import {
  CloudEvent,
  CloudEventV1,
  emitterFor,
  httpTransport,
} from 'cloudevents'

@Injectable()
export class CloudEvents {
  async send<T>(cloudEvent: CloudEventV1<T>, url: string) {
    try {
      const emit = emitterFor(httpTransport(url))
      const event = new CloudEvent(cloudEvent)
      await emit(event)
    } catch (e) {
      // TODO - Don't return the error, just report it to datadog
      console.log(e)
    }
  }
}
