import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return 200 OK and dashboard aggregation payload', () => {
      return request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('metrics');
          expect(res.body).toHaveProperty('activityDistribution');
          expect(res.body).toHaveProperty('recentActivities');
        });
    });
  });

  describe('POST /api/profiles (Validation & Flow)', () => {
    it('should fail with 400 Bad Request when required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/api/profiles')
        .send({ bio: 'Missing name and email' })
        .expect(400);
    });
  });
});
