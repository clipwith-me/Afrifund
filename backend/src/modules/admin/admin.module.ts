import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { KycModule } from '../kyc/kyc.module';

@Module({
  imports: [CampaignsModule, KycModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
