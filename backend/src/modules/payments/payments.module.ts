import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { FlutterwaveProvider } from './providers/flutterwave.provider';
import { PaystackProvider } from './providers/paystack.provider';
import { MpesaProvider } from './providers/mpesa.provider';
import { MockPaymentProvider } from './providers/mock.provider';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    FlutterwaveProvider,
    PaystackProvider,
    MpesaProvider,
    MockPaymentProvider,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
