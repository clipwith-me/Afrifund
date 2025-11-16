import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @CurrentUser() user: any,
    @Body()
    profileDto: {
      title: string;
      expertise: string[];
      bio: string;
      company?: string;
      linkedinUrl?: string;
      yearsExperience: number;
      hourlyRate?: number;
      availableHours?: number;
    },
  ) {
    return this.mentorsService.createMentorProfile(user.id, profileDto);
  }

  @Get()
  async getAllMentors(
    @Query('expertise') expertise?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.mentorsService.getAllMentors({
      expertise,
      isActive: isActive === 'true',
    });
  }

  @Get(':id')
  async getMentorById(@Param('id') id: string) {
    return this.mentorsService.getMentorById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  async updateProfile(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateDto: any,
  ) {
    return this.mentorsService.updateMentorProfile(id, user.id, updateDto);
  }

  @Post(':id/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR, UserRole.ADMIN)
  async createSession(
    @Param('id') mentorId: string,
    @Body()
    sessionDto: {
      campaignId: string;
      title: string;
      description?: string;
      hoursSpent: number;
      sessionDate: string;
      notes?: string;
    },
  ) {
    return this.mentorsService.createMentorSession(mentorId, sessionDto.campaignId, {
      ...sessionDto,
      sessionDate: new Date(sessionDto.sessionDate),
    });
  }

  @Get(':id/ledger')
  @UseGuards(JwtAuthGuard)
  async getMentorLedger(@Param('id') id: string) {
    return this.mentorsService.getMentorLedger(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  async getMentorStats(@Param('id') id: string) {
    return this.mentorsService.getMentorStats(id);
  }

  @Get('campaign/:campaignId')
  async getCampaignMentors(@Param('campaignId') campaignId: string) {
    return this.mentorsService.getCampaignMentors(campaignId);
  }
}
