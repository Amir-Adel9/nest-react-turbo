import request from 'supertest';
import { createTestApp } from './test-app';

describe('AppController (e2e)', () => {
  it('GET /api returns status ok', async () => {
    const app = await createTestApp();
    try {
      await request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ status: 'ok', message: 'API is running' });
        });
    } finally {
      await app.close();
    }
  });
});
