import { NotificationType } from '@prisma/client';

export interface EmailTemplateData {
  type: NotificationType;
  userName: string;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const baseStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
  .content { background: #ffffff; padding: 30px; }
  .notification-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
  .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; background: #f8f9fa; }
  .icon { font-size: 48px; margin-bottom: 10px; }
  .success { color: #28a745; }
  .warning { color: #ffc107; }
  .info { color: #17a2b8; }
  .error { color: #dc3545; }
`;

function getBaseTemplate(
  userName: string,
  icon: string,
  iconClass: string,
  title: string,
  message: string,
  actionText?: string,
  actionLink?: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon ${iconClass}">${icon}</div>
          <h1 style="margin: 0;">AfriFund</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <div class="notification-box">
            <h2 style="margin-top: 0; color: #333;">${title}</h2>
            <p style="margin-bottom: 0;">${message}</p>
          </div>
          ${
            actionLink && actionText
              ? `
            <div style="text-align: center;">
              <a href="${actionLink}" class="button">${actionText}</a>
            </div>
          `
              : ''
          }
          <p>Thank you for being part of the AfriFund community!</p>
          <p style="margin-bottom: 0;">Best regards,<br><strong>The AfriFund Team</strong></p>
        </div>
        <div class="footer">
          <p style="margin: 5px 0;">© 2026 AfriFund. All rights reserved.</p>
          <p style="margin: 5px 0;">Empowering African Innovation</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getEmailTemplate(data: EmailTemplateData): EmailTemplate {
  const { type, userName, title, message, link } = data;

  let subject: string;
  let html: string;
  let text: string;
  let icon = '🔔';
  let iconClass = 'info';
  let actionText = 'View Details';

  switch (type) {
    case NotificationType.CAMPAIGN_CREATED:
      subject = 'Campaign Submitted for Review';
      icon = '📝';
      iconClass = 'info';
      actionText = 'View Campaign';
      break;

    case NotificationType.CAMPAIGN_APPROVED:
      subject = '🎉 Your Campaign is Approved!';
      icon = '✅';
      iconClass = 'success';
      actionText = 'View Live Campaign';
      break;

    case NotificationType.CAMPAIGN_REJECTED:
      subject = 'Campaign Review Update';
      icon = '❌';
      iconClass = 'error';
      actionText = 'Review Feedback';
      break;

    case NotificationType.CAMPAIGN_LAUNCHED:
      subject = '🚀 Campaign Successfully Launched!';
      icon = '🚀';
      iconClass = 'success';
      actionText = 'Share Your Campaign';
      break;

    case NotificationType.CAMPAIGN_FUNDED:
      subject = '🎊 Congratulations! Campaign Fully Funded!';
      icon = '🎊';
      iconClass = 'success';
      actionText = 'View Campaign';
      break;

    case NotificationType.PLEDGE_RECEIVED:
      subject = '💰 New Pledge Received!';
      icon = '💰';
      iconClass = 'success';
      actionText = 'View Pledge Details';
      break;

    case NotificationType.PAYMENT_COMPLETED:
      subject = '✅ Payment Completed Successfully';
      icon = '✅';
      iconClass = 'success';
      actionText = 'View Receipt';
      break;

    case NotificationType.KYC_APPROVED:
      subject = '✅ KYC Verification Approved!';
      icon = '✅';
      iconClass = 'success';
      actionText = 'Go to Dashboard';
      break;

    case NotificationType.KYC_REJECTED:
      subject = 'KYC Verification Update';
      icon = '⚠️';
      iconClass = 'warning';
      actionText = 'Resubmit Documents';
      break;

    case NotificationType.CERTIFICATE_ISSUED:
      subject = '🏆 Your Certificate is Ready!';
      icon = '🏆';
      iconClass = 'success';
      actionText = 'Download Certificate';
      break;

    case NotificationType.MENTOR_SESSION_COMPLETED:
      subject = '👥 Mentoring Session Completed';
      icon = '👥';
      iconClass = 'info';
      actionText = 'View Session Details';
      break;

    case NotificationType.PAYOUT_PROCESSED:
      subject = '💸 Payout Processed Successfully';
      icon = '💸';
      iconClass = 'success';
      actionText = 'View Transaction';
      break;

    default:
      subject = title;
      icon = '🔔';
      iconClass = 'info';
      actionText = 'View Details';
  }

  html = getBaseTemplate(userName, icon, iconClass, title, message, actionText, link);
  text = `Hi ${userName},\n\n${title}\n\n${message}\n\n${link ? `View details: ${link}` : ''}\n\nBest regards,\nThe AfriFund Team`;

  return { subject, html, text };
}
