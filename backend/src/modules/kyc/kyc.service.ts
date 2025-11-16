import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { KYCStatus, IDType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KycService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async submit(
    userId: string,
    data: {
      fullName: string;
      dateOfBirth: Date;
      idType: IDType;
      idNumber: string;
      idDocument?: string;
      address?: string;
      city?: string;
      country: string;
      postalCode?: string;
    },
  ) {
    const existingKyc = await this.prisma.kYC.findUnique({
      where: { userId },
    });

    if (existingKyc) {
      throw new ConflictException('KYC already submitted for this user');
    }

    // Mock KYC auto-approval for MVP
    const autoApprove = this.config.get('MOCK_KYC_AUTO_APPROVE') === 'true';

    const kyc = await this.prisma.kYC.create({
      data: {
        userId,
        ...data,
        status: autoApprove ? KYCStatus.APPROVED : KYCStatus.PENDING,
        reviewedAt: autoApprove ? new Date() : null,
        reviewedBy: autoApprove ? 'SYSTEM_AUTO_APPROVE' : null,
      },
    });

    // Update user verification status if auto-approved
    if (autoApprove) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
    }

    return kyc;
  }

  async getStatus(userId: string) {
    const kyc = await this.prisma.kYC.findUnique({
      where: { userId },
    });

    if (!kyc) {
      return {
        status: 'NOT_SUBMITTED',
        message: 'KYC not submitted yet',
      };
    }

    return kyc;
  }

  async approve(kycId: string, reviewedBy: string) {
    const kyc = await this.prisma.kYC.findUnique({
      where: { id: kycId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC record not found');
    }

    const updated = await this.prisma.kYC.update({
      where: { id: kycId },
      data: {
        status: KYCStatus.APPROVED,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });

    // Update user verification status
    await this.prisma.user.update({
      where: { id: kyc.userId },
      data: { isVerified: true },
    });

    return updated;
  }

  async reject(kycId: string, reviewedBy: string, reason: string) {
    const kyc = await this.prisma.kYC.findUnique({
      where: { id: kycId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC record not found');
    }

    return this.prisma.kYC.update({
      where: { id: kycId },
      data: {
        status: KYCStatus.REJECTED,
        reviewedBy,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  async getPendingKycs() {
    return this.prisma.kYC.findMany({
      where: { status: KYCStatus.PENDING },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
