import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsListener {
  constructor(private notificationsService: NotificationsService) {}

  @OnEvent('campaign.created')
  async handleCampaignCreated(campaign: any) {
    await this.notificationsService.create({
      userId: campaign.creatorId,
      type: NotificationType.CAMPAIGN_CREATED,
      title: 'Campaign Created',
      message: `Your campaign "${campaign.title}" has been submitted for review.`,
      link: `/campaigns/${campaign.slug}`,
    });
  }

  @OnEvent('campaign.approved')
  async handleCampaignApproved(campaign: any) {
    await this.notificationsService.create({
      userId: campaign.creatorId,
      type: NotificationType.CAMPAIGN_APPROVED,
      title: 'Campaign Approved',
      message: `Your campaign "${campaign.title}" has been approved and is now live!`,
      link: `/campaigns/${campaign.slug}`,
    });
  }

  @OnEvent('campaign.funded')
  async handleCampaignFunded(campaign: any) {
    await this.notificationsService.create({
      userId: campaign.creatorId,
      type: NotificationType.CAMPAIGN_FUNDED,
      title: 'Campaign Funded!',
      message: `Congratulations! Your campaign "${campaign.title}" has reached its funding goal!`,
      link: `/campaigns/${campaign.slug}`,
    });
  }

  @OnEvent('pledge.completed')
  async handlePledgeCompleted(data: { pledge: any; campaign: any }) {
    await this.notificationsService.create({
      userId: data.campaign.creatorId,
      type: NotificationType.PLEDGE_RECEIVED,
      title: 'New Pledge Received',
      message: `You received a new pledge of ${data.pledge.currency} ${data.pledge.amount} for "${data.campaign.title}"`,
      link: `/campaigns/${data.campaign.slug}`,
    });
  }

  @OnEvent('certificate.issued')
  async handleCertificateIssued(certificate: any) {
    await this.notificationsService.create({
      userId: certificate.userId,
      type: NotificationType.CERTIFICATE_ISSUED,
      title: 'Certificate Issued',
      message: `Your contribution certificate has been generated!`,
      link: `/certificates/${certificate.id}`,
    });
  }

  @OnEvent('mentor.session.completed')
  async handleMentorSessionCompleted(data: { session: any; campaign: any }) {
    await this.notificationsService.create({
      userId: data.campaign.creatorId,
      type: NotificationType.MENTOR_SESSION_COMPLETED,
      title: 'Mentor Session Completed',
      message: `A mentoring session has been completed for your campaign "${data.campaign.title}"`,
      link: `/campaigns/${data.campaign.id}`,
    });
  }
}
