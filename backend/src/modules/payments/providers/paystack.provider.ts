import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from './payment-provider.interface';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaystackProvider implements PaymentProvider {
  private readonly logger = new Logger(PaystackProvider.name);
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly callbackUrl: string;
  private readonly apiUrl = 'https://api.paystack.co';

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY', '');
    this.publicKey = this.configService.get('PAYSTACK_PUBLIC_KEY', '');
    this.callbackUrl = this.configService.get('PAYSTACK_CALLBACK_URL', 'http://localhost:3000/payment/callback');

    if (this.secretKey && this.publicKey) {
      this.logger.log('Paystack initialized with live credentials');
    } else {
      this.logger.warn('Paystack credentials not configured - payment will fail');
    }
  }

  async initializePayment(data: {
    transactionId: string;
    amount: number;
    currency: string;
    email: string;
    campaignTitle: string;
    metadata?: any;
  }): Promise<{ paymentUrl: string; reference: string }> {
    if (!this.secretKey) {
      throw new Error('Paystack not configured. Please set PAYSTACK_SECRET_KEY');
    }

    try {
      const reference = `PS-${data.transactionId}-${Date.now()}`;

      // Paystack amount is in kobo (smallest currency unit)
      // For NGN: 1 NGN = 100 kobo
      const amountInKobo = Math.round(data.amount * 100);

      const payload = {
        email: data.email,
        amount: amountInKobo,
        currency: data.currency,
        reference,
        callback_url: this.callbackUrl,
        metadata: {
          transactionId: data.transactionId,
          campaignTitle: data.campaignTitle,
          custom_fields: [
            {
              display_name: 'Campaign',
              variable_name: 'campaign',
              value: data.campaignTitle,
            },
          ],
          ...data.metadata,
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      };

      const response = await axios.post(
        `${this.apiUrl}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status) {
        return {
          paymentUrl: response.data.data.authorization_url,
          reference,
        };
      }

      throw new Error(response.data.message || 'Failed to initialize Paystack payment');
    } catch (error) {
      this.logger.error('Paystack initialization failed', error);
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
    if (!this.secretKey) {
      throw new Error('Paystack not configured');
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (response.data.status) {
        const data = response.data.data;
        return {
          success: data.status === 'success',
          amount: data.amount / 100, // Convert from kobo to main currency
          currency: data.currency,
          reference: data.reference,
          status: data.status,
        };
      }

      throw new Error('Failed to verify Paystack payment');
    } catch (error) {
      this.logger.error('Paystack verification failed', error);
      throw error;
    }
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    if (!this.secretKey) {
      this.logger.warn('Paystack secret key not configured - skipping webhook verification');
      return true; // Allow in dev mode
    }

    if (!signature) {
      return false;
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
    const data = payload.data || payload;

    return {
      reference: data.reference,
      status: data.status === 'success' ? 'success' : 'failed',
      amount: (data.amount || 0) / 100, // Convert from kobo
      currency: data.currency,
      metadata: {
        transactionId: data.id,
        paystackRef: data.reference,
        channel: data.channel,
        customer: data.customer,
        authorization: data.authorization,
      },
    };
  }
}
