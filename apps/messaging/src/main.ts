import motd from '@lib/shared-config/motd'
import { NestFactory } from '@nestjs/core'
import { MessagingModule } from './messaging.module'

async function bootstrap() {
  const app = await NestFactory.create(MessagingModule)
  await app.listen(3006)

  motd([
    '• ▌ ▄ ·. ▄▄▄ ..▄▄ · .▄▄ ·  ▄▄▄·  ▄▄ • ▪   ▐ ▄  ▄▄ •',
    '·██ ▐███▪▀▄.▀·▐█ ▀. ▐█ ▀. ▐█ ▀█ ▐█ ▀ ▪██ •█▌▐█▐█ ▀ ▪',
    '▐█ ▌▐▌▐█·▐▀▀▪▄▄▀▀▀█▄▄▀▀▀█▄▄█▀▀█ ▄█ ▀█▄▐█·▐█▐▐▌▄█ ▀█▄',
    '██ ██▌▐█▌▐█▄▄▌▐█▄▪▐█▐█▄▪▐█▐█▪ ▐▌▐█▄▪▐█▐█▌██▐█▌▐█▄▪▐█',
    '▀▀  █▪▀▀▀ ▀▀▀  ▀▀▀▀  ▀▀▀▀  ▀  ▀ ·▀▀▀▀ ▀▀▀▀▀ █▪·▀▀▀▀',
    '',
    `Messaging Application is running on: ${await app.getUrl()}`,
  ])
}
bootstrap()
