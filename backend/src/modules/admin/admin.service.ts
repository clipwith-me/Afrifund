import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CampaignStatus, PledgeStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCampaigns,
      activeCampaigns,
      pendingCampaigns,
      totalPledges,
      completedPledges,
      totalRevenue,
      pendingKyc,
      totalMentors,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.campaign.count(),
      this.prisma.campaign.count({
        where: { status: CampaignStatus.ACTIVE },
      }),
      this.prisma.campaign.count({
        where: { status: CampaignStatus.PENDING_APPROVAL },
      }),
      this.prisma.pledge.count(),
      this.prisma.pledge.count({
        where: { status: PledgeStatus.COMPLETED },
      }),
      this.prisma.platformRevenue.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.kYC.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.mentor.count({
        where: { isActive: true },
      }),
    ]);

    const totalPledgeAmount = await this.prisma.pledge.aggregate({
      where: { status: PledgeStatus.COMPLETED },
      _sum: { amount: true },
    });

    return {
      users: {
        total: totalUsers,
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        pending: pendingCampaigns,
      },
      pledges: {
        total: totalPledges,
        completed: completedPledges,
        totalAmount: totalPledgeAmount._sum.amount || 0,
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
      },
      kyc: {
        pending: pendingKyc,
      },
      mentors: {
        total: totalMentors,
      },
    };
  }

  async getRecentActivity() {
    const [recentCampaigns, recentPledges, recentUsers] = await Promise.all([
      this.prisma.campaign.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.pledge.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
            },
          },
          backer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      recentCampaigns,
      recentPledges,
      recentUsers,
    };
  }

  async getRevenueAnalytics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate) {
      where.collectedAt = {
        gte: startDate,
      };
    }

    if (endDate) {
      where.collectedAt = {
        ...where.collectedAt,
        lte: endDate,
      };
    }

    const revenue = await this.prisma.platformRevenue.findMany({
      where,
      include: {
        pledge: {
          include: {
            campaign: {
              select: {
                title: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { collectedAt: 'desc' },
    });

    const totalRevenue = revenue.reduce((sum, r) => sum + Number(r.amount), 0);

    // Group by category
    const revenueByCategory: Record<string, number> = {};
    revenue.forEach((r) => {
      const category = r.pledge.campaign.category;
      revenueByCategory[category] = (revenueByCategory[category] || 0) + Number(r.amount);
    });

    return {
      total: totalRevenue,
      transactions: revenue,
      byCategory: revenueByCategory,
    };
  }

  async getPlatformStats() {
    const [
      usersByRole,
      campaignsByStatus,
      campaignsByCategory,
      pledgesByStatus,
    ] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.campaign.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.campaign.groupBy({
        by: ['category'],
        _count: true,
      }),
      this.prisma.pledge.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      usersByRole,
      campaignsByStatus,
      campaignsByCategory,
      pledgesByStatus,
    };
  }

  async getAllUsers(filters?: {
    role?: string;
    isVerified?: boolean;
  }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            campaigns: true,
            pledges: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processPayout(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        pledges: {
          where: { status: PledgeStatus.COMPLETED },
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Calculate total payout (sum of net amounts)
    const totalPayout = campaign.pledges.reduce(
      (sum, pledge) => sum + Number(pledge.netAmount),
      0,
    );

    // In a real implementation, this would integrate with a payout provider
    // For MVP, we'll just return the payout details
    return {
      campaignId,
      campaignTitle: campaign.title,
      totalPledges: campaign.pledges.length,
      totalAmount: Number(campaign.amountRaised),
      platformFees: campaign.pledges.reduce((sum, p) => sum + Number(p.platformFee), 0),
      payoutAmount: totalPayout,
      status: 'PENDING_PROCESSING',
    };
  }
}
