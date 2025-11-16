import { Controller, Post, Get, Body, UseGuards, Patch, Param } from '@nestjs/common';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, IDType } from '@prisma/client';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  async submit(
    @CurrentUser() user: any,
    @Body()
    submitDto: {
      fullName: string;
      dateOfBirth: string;
      idType: IDType;
      idNumber: string;
      idDocument?: string;
      address?: string;
      city?: string;
      country: string;
      postalCode?: string;
    },
  ) {
    return this.kycService.submit(user.id, {
      ...submitDto,
      dateOfBirth: new Date(submitDto.dateOfBirth),
    });
  }

  @Get('status')
  async getStatus(@CurrentUser() user: any) {
    return this.kycService.getStatus(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('pending')
  async getPendingKycs() {
    return this.kycService.getPendingKycs();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/approve')
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.kycService.approve(id, user.id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { reason: string },
  ) {
    return this.kycService.reject(id, user.id, body.reason);
  }
}
