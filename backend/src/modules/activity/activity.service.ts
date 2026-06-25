import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ActivityType } from '@prisma/client';

export interface CreateActivityData {
  type: ActivityType;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  campaignId?: string;
  campaignTitle?: string;
  pledgeId?: string;
  amount?: number;
  currency?: string;
  message: string;
  metadata?: any;
}

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: CreateActivityData) {
    try {
      return await this.prisma.activity.create({
        data: {
          ...data,
          amount: data.amount ? String(data.amount) : undefined,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create activity', error);
      throw error;
    }
  }

  async getRecentActivities(limit = 50, skip = 0) {
    return this.prisma.activity.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: true,
            featuredImage: true,
          },
        },
      },
    });
  }

  async getActivitiesByType(type: ActivityType, limit = 20) {
    return this.prisma.activity.findMany({
      where: { type },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async getUserActivities(userId: string, limit = 20) {
    return this.prisma.activity.findMany({
      where: { userId },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: true,
          },
        },
      },
    });
  }

  async getCampaignActivities(campaignId: string, limit = 20) {
    return this.prisma.activity.findMany({
      where: { campaignId },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async getActivityStats() {
    const [
      totalActivities,
      recentCampaigns,
      recentPledges,
      recentUsers,
    ] = await Promise.all([
      this.prisma.activity.count(),
      this.prisma.activity.count({
        where: { type: ActivityType.CAMPAIGN_LAUNCHED },
      }),
      this.prisma.activity.count({
        where: { type: ActivityType.PLEDGE_MADE },
      }),
      this.prisma.activity.count({
        where: { type: ActivityType.USER_JOINED },
      }),
    ]);

    return {
      totalActivities,
      recentCampaigns,
      recentPledges,
      recentUsers,
    };
  }
}
