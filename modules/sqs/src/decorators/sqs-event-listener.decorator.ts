import { OnEvent } from '@nestjs/event-emitter'
import { SqsQueueEvent } from '../consumer/sqs-queue.events'
import { getEventForQueue } from '../util/get-event-for-queue.util'

/**
 * Registers an event handler for a specific queue.
 * @param queueName name of the SQS queue.
 * @param event the event to listen to.
 */
export function SqsQueueEventListener(
  queueName: string,
  event: SqsQueueEvent,
): MethodDecorator {
  const eventName = getEventForQueue(event, queueName)
  return OnEvent(eventName)
}
