import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { NotificationType } from '@prisma/client';
import { getEmailTemplate } from './templates/email-templates';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendNotificationEmailOptions {
  to: string;
  userName: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appUrl: string;

  constructor(private configService: ConfigService) {
    this.fromEmail = this.configService.get('SMTP_FROM_EMAIL', 'noreply@afrifund.com');
    this.fromName = this.configService.get('SMTP_FROM_NAME', 'AfriFund');
    this.appUrl = this.configService.get('APP_URL', 'https://afrifund.vercel.app');

    // Create transporter
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT', 587);
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      // Production SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort as string),
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('Email service initialized with SMTP configuration');
    } else {
      // Development: Use ethereal for testing
      this.logger.warn('SMTP credentials not configured. Using ethereal test account for development.');
      this.createEtherealTransporter();
    }
  }

  private async createEtherealTransporter() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(`Ethereal test account created: ${testAccount.user}`);
    } catch (error) {
      this.logger.error('Failed to create ethereal test account', error);
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to}: ${info.messageId}`);

      // Log ethereal preview URL in development
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Preview URL: ${previewUrl}`);
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async sendNotificationEmail(options: SendNotificationEmailOptions): Promise<boolean> {
    try {
      const template = getEmailTemplate({
        type: options.type,
        userName: options.userName,
        title: options.title,
        message: options.message,
        link: options.link ? `${this.appUrl}${options.link}` : undefined,
        metadata: options.metadata,
      });

      return await this.sendEmail({
        to: options.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (error) {
      this.logger.error(`Failed to send notification email`, error);
      return false;
    }
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AfriFund!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Welcome to <strong>AfriFund</strong> - Africa's premier crowdfunding and mentorship platform for innovators and entrepreneurs!</p>
            <p>You're now part of a vibrant community connecting creators, backers, and mentors across Africa.</p>
            <h3>What You Can Do:</h3>
            <ul>
              <li><strong>Launch Campaigns:</strong> Fund your innovative projects and ideas</li>
              <li><strong>Back Projects:</strong> Support African innovators making a difference</li>
              <li><strong>Get Mentorship:</strong> Connect with experienced mentors who share equity in your success</li>
              <li><strong>Track Progress:</strong> Monitor your campaigns and pledges in real-time</li>
            </ul>
            <p style="text-align: center;">
              <a href="${this.appUrl}/dashboard" class="button">Go to Dashboard</a>
            </p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br><strong>The AfriFund Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2026 AfriFund. All rights reserved.</p>
            <p>Empowering African Innovation</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject: 'Welcome to AfriFund - Let\'s Build Something Amazing!',
      html,
      text: `Hi ${userName}, Welcome to AfriFund! You're now part of Africa's premier crowdfunding and mentorship platform. Visit ${this.appUrl}/dashboard to get started.`,
    });
  }

  async sendPasswordResetEmail(to: string, userName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${this.appUrl}/auth/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>We received a request to reset your password for your AfriFund account.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            <div class="warning">
              <strong>Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </div>
            <p>Best regards,<br><strong>The AfriFund Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2026 AfriFund. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject: 'Reset Your AfriFund Password',
      html,
      text: `Hi ${userName}, You requested to reset your password. Click this link to reset it: ${resetUrl}. This link expires in 1 hour.`,
    });
  }
}
