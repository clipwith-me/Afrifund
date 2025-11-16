import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: UserRole;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (data.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: data.phone },
      });

      if (phoneExists) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        kyc: true,
        mentorProfile: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        kyc: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async update(userId: string, data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
  }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    return user;
  }

  async getDashboard(userId: string) {
    const user = await this.findById(userId);

    const [campaigns, pledges, certificates] = await Promise.all([
      this.prisma.campaign.findMany({
        where: { creatorId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.pledge.findMany({
        where: { backerId: userId },
        include: { campaign: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.certificate.findMany({
        where: { userId },
        orderBy: { issuedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      user,
      campaigns,
      pledges,
      certificates,
    };
  }
}
