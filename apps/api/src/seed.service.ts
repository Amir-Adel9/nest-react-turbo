import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './common/config/env.validation';
import { UsersService } from './users/users.service';

const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_NAME = 'Admin';
const DEV_SEED_PASSWORD = 'admin123!';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async onModuleInit() {
    this.logger.log('🌱 Checking if database seeding is required...');

    const existingAdmin =
      await this.usersService.findUserByEmail(DEFAULT_ADMIN_EMAIL);

    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping seed.');
      return;
    }

    const adminPassword = this.configService.get('ADMIN_SEED_PASSWORD', {
      infer: true,
    });
    const password = adminPassword ?? DEV_SEED_PASSWORD;

    if (adminPassword === undefined) {
      this.logger.warn(
        'ADMIN_SEED_PASSWORD not set; using default. Set ADMIN_SEED_PASSWORD in production for a secure password.',
      );
    }

    await this.usersService.createUser({
      email: DEFAULT_ADMIN_EMAIL,
      name: DEFAULT_ADMIN_NAME,
      password,
    });

    this.logger.log(`✅ Seeding initial admin user: ${DEFAULT_ADMIN_EMAIL}`);
  }
}
