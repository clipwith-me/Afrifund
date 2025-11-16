import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class MpesaProvider implements PaymentProvider {
  private readonly baseUrl = 'https://sandbox.safaricom.co.ke';
  private readonly consumerKey: string;
  private readonly consumerSecret: string;

  constructor(private config: ConfigService) {
    this.consumerKey = this.config.get('MPESA_CONSUMER_KEY') || 'MOCK_KEY';
    this.consumerSecret = this.config.get('MPESA_CONSUMER_SECRET') || 'MOCK_SECRET';
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
    if (this.consumerKey === 'MOCK_KEY') {
      return {
        paymentUrl: `http://localhost:3000/payment/mock?reference=MPESA-${data.transactionId}`,
        reference: `MPESA-${data.transactionId}`,
      };
    }

    // Real M-Pesa implementation (STK Push)
    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const password = Buffer.from(
        `${this.config.get('MPESA_SHORTCODE')}${this.config.get('MPESA_PASSKEY')}${timestamp}`,
      ).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: this.config.get('MPESA_SHORTCODE'),
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.floor(data.amount),
          PartyA: data.metadata?.phoneNumber || '254700000000',
          PartyB: this.config.get('MPESA_SHORTCODE'),
          PhoneNumber: data.metadata?.phoneNumber || '254700000000',
          CallBackURL: `${this.config.get('FRONTEND_URL')}/api/v1/payments/webhook/mpesa`,
          AccountReference: data.transactionId,
          TransactionDesc: `Contribution to ${data.campaignTitle}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        paymentUrl: `mpesa://stkpush`,
        reference: response.data.CheckoutRequestID,
      };
    } catch (error) {
      console.error('M-Pesa initialization error:', error.message);
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
    if (this.consumerKey === 'MOCK_KEY') {
      return {
        success: true,
        amount: 100,
        currency: 'KES',
        reference,
        status: 'success',
      };
    }

    // M-Pesa doesn't have direct verification, relies on callback
    return {
      success: false,
      amount: 0,
      currency: 'KES',
      reference,
      status: 'pending',
    };
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    // M-Pesa uses IP whitelisting instead of signature verification
    return true;
  }

  parseWebhook(payload: any): {
    reference: string;
    status: 'success' | 'failed';
    amount: number;
    currency: string;
    metadata?: any;
  } {
    const result = payload.Body.stkCallback;
    return {
      reference: result.CheckoutRequestID,
      status: result.ResultCode === 0 ? 'success' : 'failed',
      amount: result.CallbackMetadata?.Item?.find((i: any) => i.Name === 'Amount')?.Value || 0,
      currency: 'KES',
      metadata: result,
    };
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

    const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    return response.data.access_token;
  }
}
