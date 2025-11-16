import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { CertificatesService } from './certificates.service';

@Processor('certificates')
export class CertificateProcessor {
  constructor(private certificatesService: CertificatesService) {}

  @Process('generate')
  async handleCertificateGeneration(job: Job) {
    const { pledgeId } = job.data;
    await this.certificatesService.generate(pledgeId);
    return { success: true };
  }
}
