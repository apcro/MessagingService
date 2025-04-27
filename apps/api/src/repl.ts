import { repl } from '@nestjs/core'
import { AppModule } from './api.module'

async function bootstrap() {
  await repl(AppModule)
}

bootstrap()
