import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { BullModule } from '@nestjs/bull';
import { CertificateProcessor } from './certificate.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'certificates',
    }),
  ],
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificateProcessor],
  exports: [CertificatesService],
})
export class CertificatesModule {}
