declare global {
  // eslint-disable-next-line no-var
  var __MONGO_SERVER__: { stop: () => Promise<void> } | undefined;
}

export default async function globalSetup(): Promise<void> {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-test-secret';

  if (process.env.MONGODB_URI) {
    return;
  }
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    const uri = server.getUri();
    process.env.MONGODB_URI = uri;
    (globalThis as typeof globalThis & { __MONGO_SERVER__?: { stop: () => Promise<void> } }).__MONGO_SERVER__ = server;
  } catch {
    throw new Error(
      'E2E tests require either MONGODB_URI (e.g. from Docker) or mongodb-memory-server. Run: pnpm add -D mongodb-memory-server --filter api',
    );
  }
}
