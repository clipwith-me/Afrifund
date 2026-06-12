import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { BullModule } from '@nestjs/bull';
import { CertificateProcessor } from './certificate.processor';

// Check if Redis is available (optional for MVP deployment)
const isRedisEnabled = process.env.REDIS_HOST !== undefined || process.env.REDIS_URL !== undefined;

@Module({
  imports: [
    // Bull Queue is optional - only enabled if Redis is available
    ...(isRedisEnabled
      ? [
          BullModule.registerQueue({
            name: 'certificates',
          }),
        ]
      : []),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificateProcessor],
  exports: [CertificatesService],
})
export class CertificatesModule {}
