import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { SeedService } from './seed.service';
import { Env, validateEnv } from '../common/config/env.validation';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env, true>) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI', {
          infer: true,
        }) as string,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [SeedService],
})
export class AppModule {}
