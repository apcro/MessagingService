import { Injectable, OnModuleInit } from '@nestjs/common'
import { mapping } from 'cassandra-driver'
import { CassandraService } from './cassandra.service'
import { DelayQueue } from './delayqueue.model'

@Injectable()
export class CassandraRepository implements OnModuleInit {
  constructor(private cassandraService: CassandraService) {}

  cassandraDelayMapper: mapping.ModelMapper<DelayQueue>

  onModuleInit() {
    const mappingOptions: mapping.MappingOptions = {
      models: {
        DelayQueue: {
          tables: ['delayqueue'],
          mappings: new mapping.UnderscoreCqlToCamelCaseMappings(),
        },
      },
    }

    this.cassandraDelayMapper = this.cassandraService
      .createMapper(mappingOptions)
      .forModel('DelayQueue')
  }

  async getDelayedEvents() {
    return (await this.cassandraDelayMapper.findAll()).toArray()
  }

  async getEventsByDate(date: string) {
    return (await this.cassandraDelayMapper.find({ date: date })).toArray()
  }

  async storeDelayedMessage(delayqueue: DelayQueue) {
    return (await this.cassandraDelayMapper.insert(delayqueue)).toArray()
  }

  async deleteDelayedMessage(messageid: string) {
    return (await this.cassandraDelayMapper.remove({ messageid })).toArray()
  }

  async getDelayQueueById(messageid: string) {
    return (await this.cassandraDelayMapper.remove({ messageid })).toArray()
  }
}
