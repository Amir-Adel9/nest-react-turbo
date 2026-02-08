import request from 'supertest';
import { createTestApp } from './test-app';

describe('Users (e2e)', () => {
  it('GET /api/users without auth returns 401', async () => {
    const app = await createTestApp();
    try {
      await request(app.getHttpServer()).get('/api/users').expect(401);
    } finally {
      await app.close();
    }
  });

  it('GET /api/users with auth returns list', async () => {
    const app = await createTestApp();
    const agent = request.agent(app.getHttpServer());
    try {
      await agent
        .post('/api/auth/register')
        .send({
          email: 'users-list@example.com',
          name: 'List User',
          password: 'Password1!',
        })
        .expect(201);

      const res = await agent.get('/api/users').expect(200);
      type UserListItem = { email: string; name?: string; password?: unknown };
      const body = res.body as UserListItem[];
      expect(Array.isArray(body)).toBe(true);
      const user = body.find((u) => u.email === 'users-list@example.com');
      expect(user).toBeDefined();
      expect(user!.name).toBe('List User');
      expect(user!.password).toBeUndefined();
    } finally {
      await app.close();
    }
  });

  it('GET /api/users/:id with invalid id returns 404', async () => {
    const app = await createTestApp();
    const agent = request.agent(app.getHttpServer());
    try {
      await agent
        .post('/api/auth/register')
        .send({
          email: 'invalid-id@example.com',
          name: 'User',
          password: 'Password1!',
        })
        .expect(201);

      await agent.get('/api/users/000000000000000000000000').expect(404);
    } finally {
      await app.close();
    }
  });

  it('GET /api/users/:id without auth returns 401', async () => {
    const app = await createTestApp();
    try {
      await request(app.getHttpServer())
        .get('/api/users/000000000000000000000001')
        .expect(401);
    } finally {
      await app.close();
    }
  });
});
