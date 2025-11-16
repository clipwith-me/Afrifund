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
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, CampaignStatus } from '@prisma/client';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: any,
    @Body()
    createDto: {
      title: string;
      description: string;
      shortDescription: string;
      category: string;
      location: string;
      country: string;
      targetAmount: number;
      currency?: string;
      startDate: string;
      endDate: string;
      featuredImage?: string;
      videoUrl?: string;
    },
  ) {
    return this.campaignsService.create(user.id, {
      ...createDto,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
    });
  }

  @Get()
  async findAll(
    @Query('status') status?: CampaignStatus,
    @Query('category') category?: string,
    @Query('country') country?: string,
    @Query('search') search?: string,
  ) {
    return this.campaignsService.findAll({ status, category, country, search });
  }

  @Get('my-campaigns')
  @UseGuards(JwtAuthGuard)
  async getUserCampaigns(@CurrentUser() user: any) {
    return this.campaignsService.getUserCampaigns(user.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingCampaigns() {
    return this.campaignsService.getPendingCampaigns();
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.campaignsService.findBySlug(slug);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateDto: any,
  ) {
    return this.campaignsService.update(id, user.id, updateDto);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.approve(id, user.id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { reason: string },
  ) {
    return this.campaignsService.reject(id, user.id, body.reason);
  }

  @Post(':id/media')
  @UseGuards(JwtAuthGuard)
  async addMedia(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() mediaDto: {
      media: Array<{
        type: string;
        url: string;
        caption?: string;
        order?: number;
      }>;
    },
  ) {
    return this.campaignsService.addMedia(id, user.id, mediaDto.media);
  }
}
