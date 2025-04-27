import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { DelayModule } from '../src/delay.module'

describe('DelayController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [DelayModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })
})
