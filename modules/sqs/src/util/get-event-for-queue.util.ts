import { SqsQueueEvent } from '../consumer/sqs-queue.events'

export function getEventForQueue(
  event: SqsQueueEvent,
  queueName: string,
): string {
  return `${event}.${queueName}`
}
