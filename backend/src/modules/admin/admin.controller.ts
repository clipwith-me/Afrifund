import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('activity')
  async getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('revenue')
  async getRevenue(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getRevenueAnalytics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('stats')
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Get('users')
  async getAllUsers(
    @Query('role') role?: string,
    @Query('isVerified') isVerified?: string,
  ) {
    return this.adminService.getAllUsers({
      role,
      isVerified: isVerified === 'true',
    });
  }

  @Post('payout/:campaignId')
  async processPayout(@Param('campaignId') campaignId: string) {
    return this.adminService.processPayout(campaignId);
  }
}
