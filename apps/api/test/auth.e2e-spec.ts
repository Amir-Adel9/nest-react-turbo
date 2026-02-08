import request from 'supertest';
import { createTestApp } from './test-app';

describe('Auth (e2e)', () => {
  it('register with duplicate email returns 409', async () => {
    const app = await createTestApp();
    const agent = request.agent(app.getHttpServer());
    try {
      await agent
        .post('/api/auth/register')
        .send({
          email: 'dup@example.com',
          name: 'First User',
          password: 'Password1!',
        })
        .expect(201);

      await agent
        .post('/api/auth/register')
        .send({
          email: 'dup@example.com',
          name: 'Second User',
          password: 'Password1!',
        })
        .expect(409);
    } finally {
      await app.close();
    }
  });

  it('register with invalid body returns 400', async () => {
    const app = await createTestApp();
    try {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'not-an-email', name: 'A', password: 'short' })
        .expect(400);
    } finally {
      await app.close();
    }
  });

  it('login with wrong password returns 401', async () => {
    const app = await createTestApp();
    const agent = request.agent(app.getHttpServer());
    try {
      await agent
        .post('/api/auth/register')
        .send({
          email: 'wrong-pw@example.com',
          name: 'User',
          password: 'Password1!',
        })
        .expect(201);

      await agent
        .post('/api/auth/login')
        .send({ email: 'wrong-pw@example.com', password: 'WrongPassword1!' })
        .expect(401);
    } finally {
      await app.close();
    }
  });
});
