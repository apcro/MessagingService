import motd from '@lib/shared-config/motd'
import { NestFactory } from '@nestjs/core'
import { DelayModule } from './delay.module'

async function bootstrap() {
  const delayApp = await NestFactory.create(DelayModule)
  await delayApp.listen(3007)

  motd([
    '·▄▄▄▄  ▄▄▄ .▄▄▌   ▄▄▄·  ▄· ▄▌  .▄▄▄  ▄• ▄▌▄▄▄ .▄• ▄▌▄▄▄ .',
    '██· ██ ▀▄.▀·██•  ▐█ ▀█ ▐█▪██▌  ▐▀•▀█ █▪██▌▀▄.▀·█▪██▌▀▄.▀·',
    '▐█▪ ▐█▌▐▀▀▪▄██ ▪ ▄█▀▀█ ▐█▌▐█▪  █▌·.█▌█▌▐█▌▐▀▀▪▄█▌▐█▌▐▀▀▪▄',
    '██. ██ ▐█▄▄▌▐█▌ ▄▐█▪ ▐▌ ▐█▀·.  ▐█▪▄█·▐█▄█▌▐█▄▄▌▐█▄█▌▐█▄▄▌',
    '▀▀▀▀▀•  ▀▀▀ .▀▀▀  ▀  ▀   ▀ •   ·▀▀█.  ▀▀▀  ▀▀▀  ▀▀▀  ▀▀▀',
    '',
    `Delay Queue is running on: ${await delayApp.getUrl()}`,
  ])
}
bootstrap()
