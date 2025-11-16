import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class PaystackProvider implements PaymentProvider {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(private config: ConfigService) {
    this.secretKey = this.config.get('PAYSTACK_SECRET_KEY') || 'MOCK_SECRET';
  }

  async initializePayment(data: {
    transactionId: string;
    amount: number;
    currency: string;
    email: string;
    campaignTitle: string;
    metadata?: any;
  }): Promise<{ paymentUrl: string; reference: string }> {
    // Mock implementation
    if (this.secretKey === 'MOCK_SECRET') {
      return {
        paymentUrl: `http://localhost:3000/payment/mock?reference=PS-${data.transactionId}`,
        reference: `PS-${data.transactionId}`,
      };
    }

    // Real Paystack implementation
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          reference: data.transactionId,
          amount: data.amount * 100, // Paystack uses kobo
          currency: data.currency,
          email: data.email,
          callback_url: `${this.config.get('FRONTEND_URL')}/payment/callback`,
          metadata: {
            campaign_title: data.campaignTitle,
            ...data.metadata,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      return {
        paymentUrl: response.data.data.authorization_url,
        reference: data.transactionId,
      };
    } catch (error) {
      console.error('Paystack initialization error:', error.message);
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
        currency: 'NGN',
        reference,
        status: 'success',
      };
    }

    // Real implementation
    try {
      const response = await axios.get(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const data = response.data.data;
      return {
        success: data.status === 'success',
        amount: data.amount / 100, // Convert from kobo
        currency: data.currency,
        reference: data.reference,
        status: data.status,
      };
    } catch (error) {
      console.error('Paystack verification error:', error.message);
      throw error;
    }
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    if (this.secretKey === 'MOCK_SECRET') {
      return true;
    }

    const hash = crypto
      .createHmac('sha512', this.secretKey)
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
      reference: payload.data.reference,
      status: payload.data.status === 'success' ? 'success' : 'failed',
      amount: payload.data.amount / 100,
      currency: payload.data.currency,
      metadata: payload.data,
    };
  }
}
