import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class FlutterwaveProvider implements PaymentProvider {
  private readonly baseUrl = 'https://api.flutterwave.com/v3';
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(private config: ConfigService) {
    this.secretKey = this.config.get('FLUTTERWAVE_SECRET_KEY') || 'MOCK_SECRET';
    this.publicKey = this.config.get('FLUTTERWAVE_PUBLIC_KEY') || 'MOCK_PUBLIC';
  }

  async initializePayment(data: {
    transactionId: string;
    amount: number;
    currency: string;
    email: string;
    campaignTitle: string;
    metadata?: any;
  }): Promise<{ paymentUrl: string; reference: string }> {
    // Mock implementation for MVP
    if (this.secretKey === 'MOCK_SECRET') {
      return {
        paymentUrl: `http://localhost:3000/payment/mock?reference=FLW-${data.transactionId}`,
        reference: `FLW-${data.transactionId}`,
      };
    }

    // Real Flutterwave implementation
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          tx_ref: data.transactionId,
          amount: data.amount,
          currency: data.currency,
          redirect_url: `${this.config.get('FRONTEND_URL')}/payment/callback`,
          customer: {
            email: data.email,
          },
          customizations: {
            title: 'AfriFund',
            description: `Contribution to ${data.campaignTitle}`,
          },
          meta: data.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      return {
        paymentUrl: response.data.data.link,
        reference: data.transactionId,
      };
    } catch (error) {
      console.error('Flutterwave initialization error:', error.message);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<{
    success: boolean;
    amount: number;
    currency: string;
    reference: string;
    status: string;
  }> {
    // Mock implementation
    if (this.secretKey === 'MOCK_SECRET') {
      return {
        success: true,
        amount: 100,
        currency: 'USD',
        reference,
        status: 'successful',
      };
    }

    // Real implementation
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const data = response.data.data;
      return {
        success: data.status === 'successful',
        amount: data.amount,
        currency: data.currency,
        reference: data.tx_ref,
        status: data.status,
      };
    } catch (error) {
      console.error('Flutterwave verification error:', error.message);
      throw error;
    }
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    if (this.secretKey === 'MOCK_SECRET') {
      return true;
    }

    const hash = crypto
      .createHmac('sha256', this.config.get('FLUTTERWAVE_SECRET_KEY'))
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  parseWebhook(payload: any): {
    reference: string;
    status: 'success' | 'failed';
    amount: number;
    currency: string;
    metadata?: any;
  } {
    return {
      reference: payload.data.tx_ref,
      status: payload.data.status === 'successful' ? 'success' : 'failed',
      amount: payload.data.amount,
      currency: payload.data.currency,
      metadata: payload.data,
    };
  }
}
