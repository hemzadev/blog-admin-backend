// test/auth/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/google (GET) - should redirect to Google', () => {
    return request(app.getHttpServer())
      .get('/auth/google')
      .expect(302)
      .expect('Location', /accounts\.google\.com/);
  });

  afterAll(async () => {
    await app.close();
  });
});