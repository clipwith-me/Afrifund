import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ActivityType } from '@prisma/client';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getRecentActivities(
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.activityService.getRecentActivities(
      limit ? parseInt(limit) : 50,
      skip ? parseInt(skip) : 0,
    );
  }

  @Get('stats')
  async getActivityStats() {
    return this.activityService.getActivityStats();
  }

  @Get('type/:type')
  async getActivitiesByType(
    @Param('type') type: ActivityType,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getActivitiesByType(
      type,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserActivities(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getUserActivities(
      userId,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('campaign/:campaignId')
  async getCampaignActivities(
    @Param('campaignId') campaignId: string,
    @Query('limit') limit?: string,
  ) {
    return this.activityService.getCampaignActivities(
      campaignId,
      limit ? parseInt(limit) : 20,
    );
  }
}
