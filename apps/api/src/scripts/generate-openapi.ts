import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../app.module';

async function generate() {
  const app = await NestFactory.create(AppModule);
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
  process.exit(0);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
