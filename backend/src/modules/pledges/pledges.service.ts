import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PledgeStatus, PaymentProvider, CampaignStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class PledgesService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    private campaignsService: CampaignsService,
    private certificatesService: CertificatesService,
  ) {}

  async create(data: {
    campaignId: string;
    backerId: string;
    amount: number;
    currency?: string;
    message?: string;
    isAnonymous?: boolean;
  }) {
    // Verify campaign exists and is active
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: data.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Campaign is not active');
    }

    // Check if campaign has ended
    if (new Date() > campaign.endDate) {
      throw new BadRequestException('Campaign has ended');
    }

    // Calculate platform fee
    const platformFeePercentage = parseFloat(this.config.get('PLATFORM_FEE_PERCENTAGE') || '3.0');
    const platformFee = (data.amount * platformFeePercentage) / 100;
    const netAmount = data.amount - platformFee;

    // Create pledge
    const pledge = await this.prisma.pledge.create({
      data: {
        campaignId: data.campaignId,
        backerId: data.backerId,
        amount: data.amount,
        currency: data.currency || 'USD',
        platformFee,
        netAmount,
        message: data.message,
        isAnonymous: data.isAnonymous || false,
        status: PledgeStatus.PENDING,
      },
      include: {
        campaign: true,
        backer: true,
      },
    });

    return pledge;
  }

  async completePledge(pledgeId: string) {
    const pledge = await this.prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: { campaign: true, backer: true },
    });

    if (!pledge) {
      throw new NotFoundException('Pledge not found');
    }

    // Update pledge status
    const updatedPledge = await this.prisma.pledge.update({
      where: { id: pledgeId },
      data: {
        status: PledgeStatus.COMPLETED,
        completedAt: new Date(),
      },
      include: {
        campaign: true,
        backer: true,
      },
    });

    // Update campaign amount raised
    await this.campaignsService.updateAmountRaised(
      pledge.campaignId,
      Number(pledge.netAmount),
    );

    // Create platform revenue record
    await this.prisma.platformRevenue.create({
      data: {
        pledgeId,
        amount: pledge.platformFee,
        currency: pledge.currency,
        feePercentage: parseFloat(this.config.get('PLATFORM_FEE_PERCENTAGE') || '3.0'),
      },
    });

    // Generate certificate automatically
    await this.certificatesService.generate(pledgeId);

    // Emit event
    this.eventEmitter.emit('pledge.completed', {
      pledge: updatedPledge,
      campaign: pledge.campaign,
    });

    return updatedPledge;
  }

  async getUserPledges(userId: string) {
    return this.prisma.pledge.findMany({
      where: { backerId: userId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: true,
            status: true,
          },
        },
        certificate: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCampaignPledges(campaignId: string) {
    return this.prisma.pledge.findMany({
      where: {
        campaignId,
        status: PledgeStatus.COMPLETED,
      },
      include: {
        backer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPledgeById(pledgeId: string) {
    const pledge = await this.prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: {
        campaign: true,
        backer: true,
        paymentTransaction: true,
        certificate: true,
      },
    });

    if (!pledge) {
      throw new NotFoundException('Pledge not found');
    }

    return pledge;
  }

  async getTotalStats() {
    const [totalPledges, totalAmount, completedPledges] = await Promise.all([
      this.prisma.pledge.count(),
      this.prisma.pledge.aggregate({
        where: { status: PledgeStatus.COMPLETED },
        _sum: { amount: true },
      }),
      this.prisma.pledge.count({
        where: { status: PledgeStatus.COMPLETED },
      }),
    ]);

    return {
      totalPledges,
      completedPledges,
      totalAmount: totalAmount._sum.amount || 0,
    };
  }
}
