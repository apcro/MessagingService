import motd from '@lib/shared-config/motd'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './api.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3005)
  motd([
    '▄▄▄·  ▄▄▄▄· ▪',
    '▐█ ▀█ ▐█ ▄█ ██',
    '▄█▀▀█  ██▀· ▐█·',
    '▐█▪ ▐▌▐█▪·• ▐█▌',
    '▀  ▀ .▀    ▀▀▀',
    '',
    `API is running on: ${await app.getUrl()}`,
  ])
}
bootstrap()
