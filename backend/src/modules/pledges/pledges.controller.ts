import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PledgesService } from './pledges.service';
import { PaymentsService } from '../payments/payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentProvider } from '@prisma/client';

@Controller('pledges')
export class PledgesController {
  constructor(
    private readonly pledgesService: PledgesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPledge(
    @CurrentUser() user: any,
    @Body()
    pledgeDto: {
      campaignId: string;
      amount: number;
      currency?: string;
      message?: string;
      isAnonymous?: boolean;
      paymentProvider: PaymentProvider;
    },
  ) {
    // Create pledge
    const pledge = await this.pledgesService.create({
      campaignId: pledgeDto.campaignId,
      backerId: user.id,
      amount: pledgeDto.amount,
      currency: pledgeDto.currency,
      message: pledgeDto.message,
      isAnonymous: pledgeDto.isAnonymous,
    });

    // Initialize payment
    const payment = await this.paymentsService.initiatePayment({
      pledgeId: pledge.id,
      userId: user.id,
      amount: pledgeDto.amount,
      currency: pledgeDto.currency || 'USD',
      provider: pledgeDto.paymentProvider,
      metadata: {
        email: user.email,
        pledgeId: pledge.id,
        campaignId: pledgeDto.campaignId,
      },
    });

    return {
      pledge,
      payment,
    };
  }

  @Get('my-pledges')
  @UseGuards(JwtAuthGuard)
  async getUserPledges(@CurrentUser() user: any) {
    return this.pledgesService.getUserPledges(user.id);
  }

  @Get('campaign/:campaignId')
  async getCampaignPledges(@Param('campaignId') campaignId: string) {
    return this.pledgesService.getCampaignPledges(campaignId);
  }

  @Get('stats')
  async getStats() {
    return this.pledgesService.getTotalStats();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPledgeById(@Param('id') id: string) {
    return this.pledgesService.getPledgeById(id);
  }

  @Post(':id/complete')
  async completePledge(@Param('id') id: string) {
    return this.pledgesService.completePledge(id);
  }
}
