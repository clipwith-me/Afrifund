import { Controller, Post, Get, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentProvider } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @CurrentUser() user: any,
    @Body()
    paymentDto: {
      pledgeId: string;
      amount: number;
      currency: string;
      provider: PaymentProvider;
      metadata?: any;
    },
  ) {
    return this.paymentsService.initiatePayment({
      ...paymentDto,
      userId: user.id,
    });
  }

  @Get('verify/:provider/:reference')
  async verifyPayment(
    @Param('provider') provider: PaymentProvider,
    @Param('reference') reference: string,
  ) {
    return this.paymentsService.verifyPayment(provider, reference);
  }

  @Post('webhook/flutterwave')
  async flutterwaveWebhook(
    @Body() payload: any,
    @Headers('verif-hash') signature: string,
  ) {
    return this.paymentsService.handleWebhook(PaymentProvider.FLUTTERWAVE, payload, signature);
  }

  @Post('webhook/paystack')
  async paystackWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(PaymentProvider.PAYSTACK, payload, signature);
  }

  @Post('webhook/mpesa')
  async mpesaWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(PaymentProvider.MPESA, payload);
  }

  @Post('webhook/mock')
  async mockWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(PaymentProvider.MOCK, payload);
  }

  @Get('transaction/:id')
  @UseGuards(JwtAuthGuard)
  async getTransactionStatus(@Param('id') id: string) {
    return this.paymentsService.getTransactionStatus(id);
  }
}
