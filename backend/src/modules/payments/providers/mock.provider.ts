import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async initializePayment(data: {
    transactionId: string;
    amount: number;
    currency: string;
    email: string;
    campaignTitle: string;
    metadata?: any;
  }): Promise<{ paymentUrl: string; reference: string }> {
    const reference = `MOCK-${data.transactionId}`;
    return {
      paymentUrl: `http://localhost:3000/payment/mock?reference=${reference}&amount=${data.amount}&currency=${data.currency}`,
      reference,
    };
  }

  async verifyPayment(reference: string): Promise<{
    success: boolean;
    amount: number;
    currency: string;
    reference: string;
    status: string;
  }> {
    // Always return success for mock
    return {
      success: true,
      amount: 100,
      currency: 'USD',
      reference,
      status: 'success',
    };
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    // Always valid for mock
    return true;
  }

  parseWebhook(payload: any): {
    reference: string;
    status: 'success' | 'failed';
    amount: number;
    currency: string;
    metadata?: any;
  } {
    return {
      reference: payload.reference,
      status: payload.status === 'success' ? 'success' : 'failed',
      amount: payload.amount,
      currency: payload.currency,
      metadata: payload,
    };
  }
}
