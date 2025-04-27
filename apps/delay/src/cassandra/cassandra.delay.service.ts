import { Injectable } from '@nestjs/common'
import { CassandraRepository } from './cassandra.repository'
import { DelayQueue } from './delayqueue.model'

@Injectable()
export class CassandraDelayService {
  constructor(private cassandraRepository: CassandraRepository) {}

  async getDelayedEvents() {
    return this.cassandraRepository.getDelayedEvents()
  }

  async getDelayQueueById(messageid: string) {
    return this.cassandraRepository.getDelayQueueById(messageid)
  }

  async getEventsByDate(date) {
    return this.cassandraRepository.getEventsByDate(date)
  }

  async storeDelayedEvent(event) {
    const message = JSON.stringify(event)
    const delayObject = new DelayQueue()
    delayObject.messageId = event.messageId
    delayObject.date = event.date
    delayObject.payload = message
    return this.cassandraRepository.storeDelayedMessage(delayObject)
  }
}
