import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      // Check if DATABASE_URL exists
      if (!process.env.DATABASE_URL) {
        throw new Error(
          '❌ DATABASE_URL environment variable is not set!\n\n' +
          'Please configure DATABASE_URL in your Railway project:\n' +
          '1. Go to your Railway project dashboard\n' +
          '2. Add a PostgreSQL database service\n' +
          '3. Ensure DATABASE_URL is linked to your backend service\n' +
          '4. Redeploy your application\n'
        );
      }

      this.logger.log('🔄 Connecting to database...');
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error.message);

      // Provide helpful error messages
      if (error.message.includes('Environment variable not found')) {
        this.logger.error(
          '\n💡 Fix: Add DATABASE_URL to your Railway environment variables\n' +
          'Visit: https://railway.app/project/[your-project]/settings\n'
        );
      } else if (error.message.includes('ECONNREFUSED')) {
        this.logger.error(
          '\n💡 Fix: Database server is not reachable\n' +
          'Ensure PostgreSQL service is running in Railway\n'
        );
      } else if (error.message.includes('authentication failed')) {
        this.logger.error(
          '\n💡 Fix: Database credentials are invalid\n' +
          'Check your DATABASE_URL format and credentials\n'
        );
      }

      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Database disconnected');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
  }
}
