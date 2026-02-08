export default async function globalTeardown(): Promise<void> {
  const server = (
    globalThis as typeof globalThis & {
      __MONGO_SERVER__?: { stop: () => Promise<void> };
    }
  ).__MONGO_SERVER__;
  if (server?.stop) {
    await server.stop();
  }
}
