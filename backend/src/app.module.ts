import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Database
import { PrismaModule } from './database/prisma.module';

// Config
import { validate } from './config/env.validation';

// Modules
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { KycModule } from './modules/kyc/kyc.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { PledgesModule } from './modules/pledges/pledges.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { MentorsModule } from './modules/mentors/mentors.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
import { ActivityModule } from './modules/activity/activity.module';

// Check if Redis is available (optional for MVP deployment)
const isRedisEnabled = process.env.REDIS_HOST !== undefined || process.env.REDIS_URL !== undefined;

@Module({
  imports: [
    // Configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per ttl
      },
    ]),

    // Event Emitter for notifications
    EventEmitterModule.forRoot(),

    // Bull Queue for background jobs (conditional based on Redis availability)
    ...(isRedisEnabled
      ? [
          BullModule.forRootAsync({
            useFactory: () => ({
              redis: process.env.REDIS_URL || {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT) || 6379,
                password: process.env.REDIS_PASSWORD,
              },
            }),
          }),
        ]
      : []),

    // Database
    PrismaModule,

    // Health Check
    HealthModule,

    // Feature Modules
    EmailModule,
    AuthModule,
    UsersModule,
    KycModule,
    CampaignsModule,
    PledgesModule,
    PaymentsModule,
    CertificatesModule,
    MentorsModule,
    NotificationsModule,
    AdminModule,
    ActivityModule,
  ],
})
export class AppModule {}
