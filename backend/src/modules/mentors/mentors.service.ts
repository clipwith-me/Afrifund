import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MentorsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createMentorProfile(
    userId: string,
    data: {
      title: string;
      expertise: string[];
      bio: string;
      company?: string;
      linkedinUrl?: string;
      yearsExperience: number;
      hourlyRate?: number;
      availableHours?: number;
    },
  ) {
    const existingProfile = await this.prisma.mentor.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Mentor profile already exists');
    }

    // Update user role to MENTOR
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'MENTOR' },
    });

    return this.prisma.mentor.create({
      data: {
        userId,
        ...data,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async updateMentorProfile(
    mentorId: string,
    userId: string,
    data: Partial<{
      title: string;
      expertise: string[];
      bio: string;
      company: string;
      linkedinUrl: string;
      yearsExperience: number;
      hourlyRate: number;
      availableHours: number;
    }>,
  ) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor profile not found');
    }

    if (mentor.userId !== userId) {
      throw new ForbiddenException('You can only update your own mentor profile');
    }

    return this.prisma.mentor.update({
      where: { id: mentorId },
      data,
    });
  }

  async getAllMentors(filters?: {
    expertise?: string;
    isActive?: boolean;
  }) {
    const where: any = {};

    if (filters?.expertise) {
      where.expertise = {
        has: filters.expertise,
      };
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.mentor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMentorById(mentorId: string) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
          },
        },
        sessions: {
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
          orderBy: { sessionDate: 'desc' },
        },
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    return mentor;
  }

  async createMentorSession(
    mentorId: string,
    campaignId: string,
    data: {
      title: string;
      description?: string;
      hoursSpent: number;
      sessionDate: Date;
      notes?: string;
    },
  ) {
    const mentor = await this.prisma.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Calculate equity allocation (0.1% per hour as an example)
    const equityPercentage = data.hoursSpent * 0.1;

    const session = await this.prisma.mentorSession.create({
      data: {
        mentorId,
        campaignId,
        ...data,
        equityAllocated: equityPercentage,
      },
      include: {
        campaign: true,
      },
    });

    // Create ledger entry
    await this.createLedgerEntry({
      mentorId,
      sessionId: session.id,
      campaignId,
      description: `Mentoring session: ${data.title}`,
      equityPercentage,
    });

    // Update mentor total hours
    await this.prisma.mentor.update({
      where: { id: mentorId },
      data: {
        totalHours: {
          increment: data.hoursSpent,
        },
      },
    });

    // Emit event
    this.eventEmitter.emit('mentor.session.completed', {
      session,
      campaign,
    });

    return session;
  }

  async createLedgerEntry(data: {
    mentorId: string;
    sessionId?: string;
    campaignId: string;
    description: string;
    equityPercentage: number;
    vestingSchedule?: string;
  }) {
    return this.prisma.mentorLedger.create({
      data,
    });
  }

  async getMentorLedger(mentorId: string) {
    const ledger = await this.prisma.mentorLedger.findMany({
      where: { mentorId },
      include: {
        session: {
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total equity
    const totalEquity = ledger.reduce(
      (sum, entry) => sum + Number(entry.equityPercentage),
      0,
    );

    return {
      entries: ledger,
      totalEquity,
    };
  }

  async getCampaignMentors(campaignId: string) {
    return this.prisma.mentorSession.findMany({
      where: { campaignId },
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
      orderBy: { sessionDate: 'desc' },
    });
  }

  async getMentorStats(mentorId: string) {
    const [sessions, ledger, mentor] = await Promise.all([
      this.prisma.mentorSession.count({
        where: { mentorId },
      }),
      this.getMentorLedger(mentorId),
      this.prisma.mentor.findUnique({
        where: { id: mentorId },
      }),
    ]);

    return {
      totalSessions: sessions,
      totalHours: mentor?.totalHours || 0,
      totalEquity: ledger.totalEquity,
      campaigns: await this.prisma.mentorSession.groupBy({
        by: ['campaignId'],
        where: { mentorId },
        _count: true,
      }),
    };
  }
}
