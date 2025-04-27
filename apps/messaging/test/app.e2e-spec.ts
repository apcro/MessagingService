import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { MessagingModule } from '../src/messaging.module'

describe('MessagingController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MessagingModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })
})
