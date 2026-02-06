import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  // eslint-disable-next-line @typescript-eslint/require-await
  async onModuleInit() {
    this.logger.log('🌱 Checking if database seeding is required...');

    // For now, we just log. Later, this will check
    // if an Admin exists in MongoDB.
    const isDbEmpty = true;

    if (isDbEmpty) {
      this.logger.log('✅ Seeding initial admin user: admin@example.com');
    }
  }
}
