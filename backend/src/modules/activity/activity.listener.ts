import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ActivityService } from './activity.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivityListener {
  private readonly logger = new Logger(ActivityListener.name);

  constructor(private activityService: ActivityService) {}

  @OnEvent('campaign.approved')
  async handleCampaignLaunched(campaign: any) {
    try {
      await this.activityService.create({
        type: ActivityType.CAMPAIGN_LAUNCHED,
        userId: campaign.creatorId,
        userName: campaign.creator?.firstName
          ? `${campaign.creator.firstName} ${campaign.creator.lastName}`
          : undefined,
        userAvatar: campaign.creator?.avatar,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        message: `launched a new campaign: ${campaign.title}`,
        metadata: {
          category: campaign.category,
          targetAmount: campaign.targetAmount,
          currency: campaign.currency,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create campaign launch activity', error);
    }
  }

  @OnEvent('pledge.completed')
  async handlePledgeMade(data: { pledge: any; campaign: any }) {
    try {
      const { pledge, campaign } = data;
      await this.activityService.create({
        type: ActivityType.PLEDGE_MADE,
        userId: pledge.userId,
        userName: pledge.isAnonymous
          ? 'Anonymous Backer'
          : pledge.user?.firstName
            ? `${pledge.user.firstName} ${pledge.user.lastName}`
            : 'A Backer',
        userAvatar: pledge.isAnonymous ? undefined : pledge.user?.avatar,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        pledgeId: pledge.id,
        amount: Number(pledge.amount),
        currency: pledge.currency,
        message: pledge.isAnonymous
          ? `An anonymous backer pledged ${pledge.currency} ${pledge.amount} to ${campaign.title}`
          : `backed ${campaign.title} with ${pledge.currency} ${pledge.amount}`,
        metadata: {
          isAnonymous: pledge.isAnonymous,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create pledge activity', error);
    }
  }

  @OnEvent('campaign.funded')
  async handleCampaignFunded(campaign: any) {
    try {
      await this.activityService.create({
        type: ActivityType.CAMPAIGN_FUNDED,
        userId: campaign.creatorId,
        userName: campaign.creator?.firstName
          ? `${campaign.creator.firstName} ${campaign.creator.lastName}`
          : undefined,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        amount: Number(campaign.targetAmount),
        currency: campaign.currency,
        message: `${campaign.title} reached its funding goal of ${campaign.currency} ${campaign.targetAmount}!`,
        metadata: {
          category: campaign.category,
          backers: campaign.pledges?.length || 0,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create campaign funded activity', error);
    }
  }

  @OnEvent('user.registered')
  async handleUserJoined(user: any) {
    try {
      await this.activityService.create({
        type: ActivityType.USER_JOINED,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.avatar,
        message: `${user.firstName} ${user.lastName} joined AfriFund as a ${user.role.toLowerCase()}`,
        metadata: {
          role: user.role,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create user joined activity', error);
    }
  }

  @OnEvent('kyc.approved')
  async handleKycVerified(kyc: any) {
    try {
      await this.activityService.create({
        type: ActivityType.KYC_VERIFIED,
        userId: kyc.userId,
        userName: kyc.user?.firstName
          ? `${kyc.user.firstName} ${kyc.user.lastName}`
          : undefined,
        userAvatar: kyc.user?.avatar,
        message: `${kyc.user?.firstName || 'A user'} completed identity verification`,
        metadata: {
          idType: kyc.idType,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create KYC verified activity', error);
    }
  }

  @OnEvent('certificate.issued')
  async handleCertificateEarned(certificate: any) {
    try {
      await this.activityService.create({
        type: ActivityType.CERTIFICATE_EARNED,
        userId: certificate.userId,
        userName: certificate.user?.firstName
          ? `${certificate.user.firstName} ${certificate.user.lastName}`
          : undefined,
        campaignId: certificate.pledge?.campaignId,
        campaignTitle: certificate.pledge?.campaign?.title,
        message: `earned a contribution certificate for supporting ${certificate.pledge?.campaign?.title || 'a campaign'}`,
        metadata: {
          certificateNumber: certificate.certificateNumber,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create certificate activity', error);
    }
  }

  @OnEvent('mentor.session.started')
  async handleMentorSessionStarted(data: { session: any; campaign: any }) {
    try {
      const { session, campaign } = data;
      await this.activityService.create({
        type: ActivityType.MENTOR_SESSION_STARTED,
        userId: session.mentorId,
        userName: session.mentor?.user?.firstName
          ? `${session.mentor.user.firstName} ${session.mentor.user.lastName}`
          : undefined,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        message: `started a mentoring session for ${campaign.title}`,
        metadata: {
          sessionId: session.id,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create mentor session activity', error);
    }
  }
}
