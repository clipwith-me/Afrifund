import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private notificationsService: NotificationsService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  private async sendNotificationWithEmail(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) {
    // Create in-app notification
    await this.notificationsService.create(data);

    // Send email notification
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true, firstName: true, lastName: true },
      });

      if (user) {
        await this.emailService.sendNotificationEmail({
          to: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          type: data.type,
          title: data.title,
          message: data.message,
          link: data.link,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
    }
  }

  @OnEvent('campaign.created')
  async handleCampaignCreated(campaign: any) {
    await this.sendNotificationWithEmail({
      userId: campaign.creatorId,
      type: NotificationType.CAMPAIGN_CREATED,
      title: 'Campaign Created',
      message: `Your campaign "${campaign.title}" has been submitted for review.`,
      link: `/campaigns/${campaign.slug}`,
    });
  }

  @OnEvent('campaign.approved')
  async handleCampaignApproved(campaign: any) {
    await this.sendNotificationWithEmail({
      userId: campaign.creatorId,
      type: NotificationType.CAMPAIGN_APPROVED,
      title: 'Campaign Approved',
      message: `Your campaign "${campaign.title}" has been approved and is now live!`,
      link: `/campaigns/${campaign.slug}`,
    });
  }

  @OnEvent('campaign.funded')
  async handleCampaignFunded(campaign: any) {
    await this.sendNotificationWithEmail({
      userId: campaign.creatorId,
      type: NotificationType.CAMPAIGN_FUNDED,
      title: 'Campaign Funded!',
      message: `Congratulations! Your campaign "${campaign.title}" has reached its funding goal!`,
      link: `/campaigns/${campaign.slug}`,
    });
  }

  @OnEvent('pledge.completed')
  async handlePledgeCompleted(data: { pledge: any; campaign: any }) {
    await this.sendNotificationWithEmail({
      userId: data.campaign.creatorId,
      type: NotificationType.PLEDGE_RECEIVED,
      title: 'New Pledge Received',
      message: `You received a new pledge of ${data.pledge.currency} ${data.pledge.amount} for "${data.campaign.title}"`,
      link: `/campaigns/${data.campaign.slug}`,
    });
  }

  @OnEvent('certificate.issued')
  async handleCertificateIssued(certificate: any) {
    await this.sendNotificationWithEmail({
      userId: certificate.userId,
      type: NotificationType.CERTIFICATE_ISSUED,
      title: 'Certificate Issued',
      message: `Your contribution certificate has been generated!`,
      link: `/certificates/${certificate.id}`,
    });
  }

  @OnEvent('mentor.session.completed')
  async handleMentorSessionCompleted(data: { session: any; campaign: any }) {
    await this.sendNotificationWithEmail({
      userId: data.campaign.creatorId,
      type: NotificationType.MENTOR_SESSION_COMPLETED,
      title: 'Mentor Session Completed',
      message: `A mentoring session has been completed for your campaign "${data.campaign.title}"`,
      link: `/campaigns/${data.campaign.id}`,
    });
  }

  @OnEvent('campaign.rejected')
  async handleCampaignRejected(data: { campaign: any; reason?: string }) {
    await this.sendNotificationWithEmail({
      userId: data.campaign.creatorId,
      type: NotificationType.CAMPAIGN_REJECTED,
      title: 'Campaign Review Update',
      message: `Your campaign "${data.campaign.title}" was not approved. ${data.reason ? `Reason: ${data.reason}` : 'Please review the feedback and resubmit.'}`,
      link: `/campaigns/${data.campaign.slug}`,
    });
  }

  @OnEvent('kyc.approved')
  async handleKycApproved(kyc: any) {
    await this.sendNotificationWithEmail({
      userId: kyc.userId,
      type: NotificationType.KYC_APPROVED,
      title: 'KYC Verification Approved',
      message: `Your identity verification has been approved! You can now access all platform features.`,
      link: `/dashboard`,
    });
  }

  @OnEvent('kyc.rejected')
  async handleKycRejected(data: { kyc: any; reason?: string }) {
    await this.sendNotificationWithEmail({
      userId: data.kyc.userId,
      type: NotificationType.KYC_REJECTED,
      title: 'KYC Verification Update',
      message: `Your identity verification was not approved. ${data.reason ? `Reason: ${data.reason}` : 'Please review and resubmit your documents.'}`,
      link: `/dashboard/kyc`,
    });
  }

  @OnEvent('payment.completed')
  async handlePaymentCompleted(data: { payment: any; pledge: any }) {
    await this.sendNotificationWithEmail({
      userId: data.pledge.userId,
      type: NotificationType.PAYMENT_COMPLETED,
      title: 'Payment Completed',
      message: `Your payment of ${data.payment.currency} ${data.payment.amount} has been processed successfully.`,
      link: `/dashboard/pledges`,
    });
  }

  @OnEvent('payout.processed')
  async handlePayoutProcessed(data: { payout: any; userId: string }) {
    await this.sendNotificationWithEmail({
      userId: data.userId,
      type: NotificationType.PAYOUT_PROCESSED,
      title: 'Payout Processed',
      message: `Your payout of ${data.payout.currency} ${data.payout.amount} has been processed successfully.`,
      link: `/dashboard`,
    });
  }

  @OnEvent('user.registered')
  async handleUserRegistered(user: any) {
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
    }
  }
}
