import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from './payment-provider.interface';
import axios from 'axios';

@Injectable()
export class MpesaProvider implements PaymentProvider {
  private readonly logger = new Logger(MpesaProvider.name);
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly passkey: string;
  private readonly shortcode: string;
  private readonly callbackUrl: string;
  private readonly environment: 'sandbox' | 'production';
  private readonly apiUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {
    this.consumerKey = this.configService.get('MPESA_CONSUMER_KEY', '');
    this.consumerSecret = this.configService.get('MPESA_CONSUMER_SECRET', '');
    this.passkey = this.configService.get('MPESA_PASSKEY', '');
    this.shortcode = this.configService.get('MPESA_SHORTCODE', '');
    this.callbackUrl = this.configService.get('MPESA_CALLBACK_URL', 'http://localhost:3000/api/payments/webhook/mpesa');
    this.environment = this.configService.get('MPESA_ENVIRONMENT', 'sandbox') as 'sandbox' | 'production';

    this.apiUrl = this.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    if (this.consumerKey && this.consumerSecret) {
      this.logger.log(`M-Pesa initialized in ${this.environment} mode`);
    } else {
      this.logger.warn('M-Pesa credentials not configured - payment will fail');
    }
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error('M-Pesa credentials not configured');
    }

    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

      const response = await axios.get(
        `${this.apiUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, cache for 55 minutes
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get M-Pesa access token', error);
      throw error;
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
    if (!this.consumerKey || !this.consumerSecret || !this.passkey || !this.shortcode) {
      throw new Error('M-Pesa not configured. Please set MPESA credentials');
    }

    try {
      const reference = `MPESA-${data.transactionId}-${Date.now()}`;
      const token = await this.getAccessToken();

      // M-Pesa STK Push (Lipa Na M-Pesa Online)
      const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      // Extract phone number from metadata or use default format
      const phoneNumber = this.formatPhoneNumber(data.metadata?.phoneNumber || '254700000000');

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(data.amount), // M-Pesa doesn't support decimals
        PartyA: phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: reference,
        TransactionDesc: `${data.campaignTitle.substring(0, 20)}`, // Max 20 chars
      };

      const response = await axios.post(
        `${this.apiUrl}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.ResponseCode === '0') {
        // M-Pesa STK push doesn't return a URL, user enters PIN on phone
        return {
          paymentUrl: `mpesa://stkpush?reference=${reference}`, // Custom scheme for mobile
          reference: response.data.CheckoutRequestID,
        };
      }

      throw new Error(response.data.ResponseDescription || 'Failed to initialize M-Pesa payment');
    } catch (error) {
      this.logger.error('M-Pesa initialization failed', error);
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
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error('M-Pesa not configured');
    }

    try {
      const token = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
      const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

      const response = await axios.post(
        `${this.apiUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortcode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: reference,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;
      const isSuccess = data.ResultCode === '0';

      return {
        success: isSuccess,
        amount: parseFloat(data.Amount || 0),
        currency: 'KES', // M-Pesa is Kenya Shillings
        reference: data.CheckoutRequestID,
        status: isSuccess ? 'success' : 'failed',
      };
    } catch (error) {
      this.logger.error('M-Pesa verification failed', error);
      throw error;
    }
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    // M-Pesa doesn't use signatures, but we can validate the payload structure
    return !!(payload && (payload.Body || payload.Result));
  }

  parseWebhook(payload: any): {
    reference: string;
    status: 'success' | 'failed';
    amount: number;
    currency: string;
    metadata?: any;
  } {
    const body = payload.Body?.stkCallback || payload.Result || payload;

    const resultCode = body.ResultCode || body.resultCode;
    const isSuccess = resultCode === 0 || resultCode === '0';

    // Extract callback metadata
    const callbackMetadata = body.CallbackMetadata?.Item || [];
    const amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value || 0;
    const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
    const phoneNumber = callbackMetadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

    return {
      reference: body.CheckoutRequestID || body.checkoutRequestID,
      status: isSuccess ? 'success' : 'failed',
      amount: parseFloat(amount),
      currency: 'KES',
      metadata: {
        resultCode,
        resultDesc: body.ResultDesc || body.resultDesc,
        mpesaReceiptNumber,
        phoneNumber,
        transactionDate: body.TransactionDate,
      },
    };
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Ensure it starts with 254 (Kenya country code)
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }
}
