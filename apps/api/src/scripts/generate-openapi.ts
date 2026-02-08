/**
 * Generate OpenAPI schema.
 * If MONGODB_URI is missing, spin up in-memory Mongo so AppModule can boot.
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../app.module';

type OpenApiMongoServer = { stop: () => Promise<unknown> };

async function ensureMongoUri(): Promise<OpenApiMongoServer | null> {
  if (process.env.MONGODB_URI) return null;
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const server = await MongoMemoryServer.create();
  process.env.MONGODB_URI = server.getUri();
  return server;
}

async function generate() {
  const mongoServer = await ensureMongoUri();
  const app = await NestFactory.create(AppModule);
  try {
    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
      .setTitle('Easygenerator Auth API')
      .setVersion('1.0')
      .setDescription(
        'This API uses httpOnly cookies for session management: the access_token cookie is sent with general authenticated requests, and the refresh_token cookie is used for token rotation (path-restricted to /api/auth/refresh). Login and register set both cookies; protected routes require the access_token cookie.',
      )
      .addCookieAuth('access_token', { type: 'apiKey' }, 'access_token')
      .addCookieAuth('refresh_token', { type: 'apiKey' }, 'refresh_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    const outputPath = resolve(
      __dirname,
      '../../../../packages/api-contract/swagger.json',
    );
    writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');
  } finally {
    await app.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
