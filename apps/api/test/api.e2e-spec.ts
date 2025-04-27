import { CacheService } from '@modules/caching'
import { SqsProducer } from '@modules/sqs'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { DataSource } from 'typeorm'
import { AppModule } from '../src/api.module'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [SqsProducer],
    })
      .overrideProvider(DataSource)
      .useValue(
        new DataSource({
          type: 'better-sqlite3',
          database: ':memory:',
        }),
      )
      .overrideProvider(CacheService)
      .useValue({
        get: async () => null,
        set: async () => null,
      })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })
})
