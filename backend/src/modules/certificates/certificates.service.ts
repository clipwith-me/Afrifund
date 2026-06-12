import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    @Optional() @InjectQueue('certificates') private certificateQueue?: Queue,
  ) {}

  async generate(pledgeId: string) {
    const pledge = await this.prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: {
        backer: true,
        campaign: true,
      },
    });

    if (!pledge) {
      throw new NotFoundException('Pledge not found');
    }

    // Check if certificate already exists
    const existingCertificate = await this.prisma.certificate.findUnique({
      where: { pledgeId },
    });

    if (existingCertificate) {
      return existingCertificate;
    }

    // Generate certificate number
    const certificateNumber = this.generateCertificateNumber();

    // Determine contribution level
    const contributionLevel = this.getContributionLevel(Number(pledge.amount));

    // Generate PDF
    const pdfPath = await this.generatePDF({
      donorName: pledge.isAnonymous
        ? 'Anonymous Donor'
        : `${pledge.backer.firstName} ${pledge.backer.lastName}`,
      campaignTitle: pledge.campaign.title,
      amount: Number(pledge.amount),
      currency: pledge.currency,
      contributionLevel,
      certificateNumber,
      date: new Date(),
    });

    // Create certificate record
    const certificate = await this.prisma.certificate.create({
      data: {
        pledgeId,
        userId: pledge.backerId,
        certificateNumber,
        donorName: pledge.isAnonymous
          ? 'Anonymous Donor'
          : `${pledge.backer.firstName} ${pledge.backer.lastName}`,
        campaignTitle: pledge.campaign.title,
        amount: pledge.amount,
        currency: pledge.currency,
        contributionLevel,
        pdfUrl: pdfPath,
      },
    });

    // Emit event
    this.eventEmitter.emit('certificate.issued', certificate);

    return certificate;
  }

  private async generatePDF(data: {
    donorName: string;
    campaignTitle: string;
    amount: number;
    currency: string;
    contributionLevel: string;
    certificateNumber: string;
    date: Date;
  }): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

    const { width, height } = page.getSize();
    const fontSize = 14;

    // Title
    page.drawText('CERTIFICATE OF CONTRIBUTION', {
      x: width / 2 - 150,
      y: height - 100,
      size: 24,
      font: timesRomanBold,
      color: rgb(0.1, 0.3, 0.6),
    });

    // Certificate Number
    page.drawText(`Certificate No: ${data.certificateNumber}`, {
      x: 50,
      y: height - 150,
      size: 10,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Main Content
    let yPosition = height - 200;

    page.drawText('This is to certify that', {
      x: width / 2 - 80,
      y: yPosition,
      size: fontSize,
      font: timesRomanFont,
    });

    yPosition -= 40;
    page.drawText(data.donorName, {
      x: width / 2 - (data.donorName.length * 6),
      y: yPosition,
      size: 20,
      font: timesRomanBold,
      color: rgb(0.1, 0.3, 0.6),
    });

    yPosition -= 50;
    page.drawText('has made a generous contribution of', {
      x: width / 2 - 130,
      y: yPosition,
      size: fontSize,
      font: timesRomanFont,
    });

    yPosition -= 40;
    const amountText = `${data.currency} ${data.amount.toFixed(2)}`;
    page.drawText(amountText, {
      x: width / 2 - (amountText.length * 8),
      y: yPosition,
      size: 24,
      font: timesRomanBold,
      color: rgb(0.1, 0.6, 0.3),
    });

    yPosition -= 50;
    page.drawText('to support the campaign:', {
      x: width / 2 - 100,
      y: yPosition,
      size: fontSize,
      font: timesRomanFont,
    });

    yPosition -= 40;
    const maxTitleLength = 50;
    const truncatedTitle =
      data.campaignTitle.length > maxTitleLength
        ? data.campaignTitle.substring(0, maxTitleLength) + '...'
        : data.campaignTitle;
    page.drawText(`"${truncatedTitle}"`, {
      x: width / 2 - (truncatedTitle.length * 4),
      y: yPosition,
      size: 16,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    });

    yPosition -= 60;
    page.drawText(`Contribution Level: ${data.contributionLevel}`, {
      x: width / 2 - 100,
      y: yPosition,
      size: fontSize,
      font: timesRomanBold,
      color: rgb(0.6, 0.3, 0.1),
    });

    // Footer
    yPosition = 150;
    page.drawText('Thank you for empowering African innovation!', {
      x: width / 2 - 150,
      y: yPosition,
      size: 12,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    yPosition -= 30;
    page.drawText(`Issued on: ${data.date.toLocaleDateString()}`, {
      x: width / 2 - 80,
      y: yPosition,
      size: 10,
      font: timesRomanFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    yPosition -= 20;
    page.drawText('AfriFund Platform', {
      x: width / 2 - 50,
      y: yPosition,
      size: 10,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `certificate-${data.certificateNumber}.pdf`;
    const storagePath = this.config.get('CERTIFICATE_STORAGE_PATH') || './public/certificates';

    // Ensure directory exists
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }

    const filePath = path.join(storagePath, fileName);
    fs.writeFileSync(filePath, pdfBytes);

    return `/certificates/${fileName}`;
  }

  private generateCertificateNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `AFRI-${timestamp}-${random}`;
  }

  private getContributionLevel(amount: number): string {
    if (amount >= 10000) return 'Platinum';
    if (amount >= 5000) return 'Gold';
    if (amount >= 1000) return 'Silver';
    return 'Bronze';
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        pledge: {
          include: {
            campaign: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getCertificateById(certificateId: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        pledge: {
          include: {
            campaign: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return certificate;
  }

  async downloadCertificate(certificateId: string): Promise<string> {
    const certificate = await this.getCertificateById(certificateId);
    const storagePath = this.config.get('CERTIFICATE_STORAGE_PATH') || './public/certificates';
    const filePath = path.join(storagePath, path.basename(certificate.pdfUrl));

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Certificate file not found');
    }

    return filePath;
  }
}
