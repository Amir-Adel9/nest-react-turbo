/**
 * Generate OpenAPI schema during build.
 * If MONGODB_URI is not set (e.g. in Docker build), starts an in-memory MongoDB
 * and sets process.env.MONGODB_URI before AppModule is loaded so Nest uses it.
 */
declare global {
  var __OPENAPI_MONGO__: { stop: () => Promise<boolean> } | undefined;
}

async function ensureMongoUri(): Promise<void> {
  if (process.env.MONGODB_URI) return;
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const server = await MongoMemoryServer.create();
  process.env.MONGODB_URI = server.getUri();
  globalThis.__OPENAPI_MONGO__ = server;
}

import type { AppModule } from '../src/app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join, resolve } from 'path';

async function generate() {
  await ensureMongoUri();
  // At runtime script is at dist/src/scripts/, so app.module is at ../../app.module
  const appModulePath = join(__dirname, '../../app.module');
  const loaded = (await import(appModulePath)) as {
    AppModule: typeof AppModule;
  };
  const app = await NestFactory.create(loaded.AppModule);
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Easygenerator Auth API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  const outputPath = resolve(
    __dirname,
    '../../../../../packages/api-contract/swagger.json',
  );
  writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf-8');
  await app.close();
  if (globalThis.__OPENAPI_MONGO__) await globalThis.__OPENAPI_MONGO__.stop();
  process.exit(0);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
