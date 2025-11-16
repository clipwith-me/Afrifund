import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CampaignStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import slugify from 'slugify';

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: string,
    data: {
      title: string;
      description: string;
      shortDescription: string;
      category: string;
      location: string;
      country: string;
      targetAmount: number;
      currency?: string;
      startDate: Date;
      endDate: Date;
      featuredImage?: string;
      videoUrl?: string;
    },
  ) {
    // Verify user is KYC verified
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kyc: true },
    });

    if (!user.isVerified || !user.kyc || user.kyc.status !== 'APPROVED') {
      throw new ForbiddenException('You must complete KYC verification to create a campaign');
    }

    // Generate unique slug
    let slug = slugify(data.title, { lower: true, strict: true });
    const existingSlug = await this.prisma.campaign.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        ...data,
        slug,
        creatorId: userId,
        status: CampaignStatus.PENDING_APPROVAL,
      },
    });

    // Emit event
    this.eventEmitter.emit('campaign.created', campaign);

    return campaign;
  }

  async findAll(filters?: {
    status?: CampaignStatus;
    category?: string;
    country?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    } else {
      where.status = CampaignStatus.ACTIVE;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.country) {
      where.country = filters.country;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.campaign.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            pledges: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        media: true,
        pledges: {
          where: { status: 'COMPLETED' },
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
        },
        mentorSessions: {
          include: {
            mentor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async findBySlug(slug: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        media: true,
        pledges: {
          where: { status: 'COMPLETED', isAnonymous: false },
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
          take: 10,
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(campaignId: string, userId: string, data: any) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.creatorId !== userId) {
      throw new ForbiddenException('You can only update your own campaigns');
    }

    if (campaign.status === CampaignStatus.ACTIVE || campaign.status === CampaignStatus.FUNDED) {
      throw new BadRequestException('Cannot update an active or funded campaign');
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data,
    });
  }

  async approve(campaignId: string, adminId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.ACTIVE,
        approvedBy: adminId,
        approvedAt: new Date(),
      },
      include: {
        creator: true,
      },
    });

    // Emit event
    this.eventEmitter.emit('campaign.approved', updated);

    return updated;
  }

  async reject(campaignId: string, adminId: string, reason: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.REJECTED,
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  async addMedia(campaignId: string, userId: string, media: Array<{
    type: string;
    url: string;
    caption?: string;
    order?: number;
  }>) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.creatorId !== userId) {
      throw new ForbiddenException('You can only add media to your own campaigns');
    }

    return this.prisma.campaignMedia.createMany({
      data: media.map((m) => ({
        campaignId,
        ...m,
      })),
    });
  }

  async getUserCampaigns(userId: string) {
    return this.prisma.campaign.findMany({
      where: { creatorId: userId },
      include: {
        _count: {
          select: {
            pledges: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingCampaigns() {
    return this.prisma.campaign.findMany({
      where: { status: CampaignStatus.PENDING_APPROVAL },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateAmountRaised(campaignId: string, amount: number) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const newAmountRaised = Number(campaign.amountRaised) + amount;
    const targetAmount = Number(campaign.targetAmount);

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        amountRaised: newAmountRaised,
        status: newAmountRaised >= targetAmount ? CampaignStatus.FUNDED : campaign.status,
      },
    });

    // Emit event if funded
    if (newAmountRaised >= targetAmount) {
      this.eventEmitter.emit('campaign.funded', updated);
    }

    return updated;
  }
}
