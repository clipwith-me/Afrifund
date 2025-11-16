import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import * as fs from 'fs';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('my-certificates')
  @UseGuards(JwtAuthGuard)
  async getUserCertificates(@CurrentUser() user: any) {
    return this.certificatesService.getUserCertificates(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCertificateById(@Param('id') id: string) {
    return this.certificatesService.getCertificateById(id);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadCertificate(@Param('id') id: string, @Res() res: Response) {
    const filePath = await this.certificatesService.downloadCertificate(id);
    const certificate = await this.certificatesService.getCertificateById(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=certificate-${certificate.certificateNumber}.pdf`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  }
}
