import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));

  const config = new DocumentBuilder()
    .setTitle('Easygenerator Auth API')
    .setVersion('1.0')
    .setDescription(
      'This API uses httpOnly cookies for session management: the access_token cookie is sent with general authenticated requests, and the refresh_token cookie is used for token rotation (path-restricted to /api/auth/refresh). Login and register set both cookies; protected routes require the access_token cookie.',
    )
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
    })
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refresh_token',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: 'http://localhost:5173',
      credentials: true,
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
