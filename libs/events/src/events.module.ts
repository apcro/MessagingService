import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CloudEvents } from './cloudevents'
import eventsConfiguration from './configuration'
import { MessageEvent } from './messageevent'

@Module({
  imports: [ConfigModule.forFeature(eventsConfiguration)],
  providers: [MessageEvent, CloudEvents],
  exports: [MessageEvent],
})
export class EventsModule {}
