import { Module } from '@nestjs/common';
import { PledgesService } from './pledges.service';
import { PledgesController } from './pledges.controller';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { PaymentsModule } from '../payments/payments.module';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [CampaignsModule, PaymentsModule, CertificatesModule],
  controllers: [PledgesController],
  providers: [PledgesService],
  exports: [PledgesService],
})
export class PledgesModule {}
