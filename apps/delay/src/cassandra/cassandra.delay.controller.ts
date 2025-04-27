import { Controller, Get, Param } from '@nestjs/common'
import { CassandraDelayService } from './cassandra.delay.service'

@Controller()
export class CassandraDelayController {
  constructor(private cassandraDelayService: CassandraDelayService) {}

  @Get('delayedevents')
  async getDelayedEvents() {
    return this.cassandraDelayService.getDelayedEvents()
  }

  @Get('delayedevents/id/:messageid')
  async getDelayQueueById(@Param('messageid') messageid: string) {
    return this.cassandraDelayService.getDelayQueueById(messageid)
  }

  @Get('delayedevents/date/:date')
  async getEventsByDate(@Param('date') date: string) {
    return this.cassandraDelayService.getEventsByDate(date)
  }
}
