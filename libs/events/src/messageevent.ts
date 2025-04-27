import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { Version } from 'cloudevents'
import { randomUUID } from 'crypto'
import { CloudEvents } from './cloudevents'
import eventsConfiguration from './configuration'
import { CloudEventData, EventParams, EventVersion } from './types'

@Injectable()
export class MessageEvent {
  @Inject(CloudEvents)
  private cloudEvents: CloudEvents
  @Inject(eventsConfiguration.KEY)
  private readonly eventConfig: ConfigType<typeof eventsConfiguration>

  private async send<T>({
    resourceName,
    resourceId,
    type,
    data,
    origin,
    publisherUrl,
  }: EventParams<T>) {
    if (!this.eventConfig.enabled) {
      return
    }

    const cloudEventType = `${resourceName.toLowerCase()}-${type.toLowerCase()}`
    const eventId = randomUUID().replace(/-/g, '')

    await this.cloudEvents.send<CloudEventData>(
      {
        id: eventId,
        specversion: Version.V1,
        source: 'messaging-service',
        type: cloudEventType,
        datacontenttype: 'application/json',
        data: {
          id: eventId,
          created_at: new Date().toISOString(),
          type,
          resource_name: resourceName,
          resource_id: resourceId,
          version: EventVersion.V1,
          origin,
          data,
        },
      },
      publisherUrl,
    )
  }
}
