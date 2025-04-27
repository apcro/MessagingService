export type EventConfig = {
  enabled: boolean
  sendMessagingEventHost: string
}

export enum EventStatus {
  SUCCEEDED = '_SUCCEEDED',
  FAILED = '_FAILED',
  RETRY = '_RETRY',
}

export enum EventVersion {
  V1 = 'v1',
}

export class EventParams<T = unknown> {
  type: string
  resourceName: string
  resourceId: string
  origin: string
  publisherUrl: string
  data: T
}

export class CloudEventData<T = unknown> {
  id: string
  created_at: string
  type: string
  resource_name: string
  resource_id: string
  version: EventVersion
  origin: string
  data: T
}
