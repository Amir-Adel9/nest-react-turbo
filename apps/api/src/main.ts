import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix to /api
  app.setGlobalPrefix('api');

  // Enable CORS only in development, allowing requests from Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: 'http://localhost:5173', // Vite default dev server port
      credentials: true,
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
