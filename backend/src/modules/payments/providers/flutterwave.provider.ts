import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from './payment-provider.interface';
import Flutterwave from 'flutterwave-node-v3';
import * as crypto from 'crypto';

@Injectable()
export class FlutterwaveProvider implements PaymentProvider {
  private readonly logger = new Logger(FlutterwaveProvider.name);
  private flw: any;
  private readonly publicKey: string;
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly redirectUrl: string;

  constructor(private configService: ConfigService) {
    this.publicKey = this.configService.get('FLUTTERWAVE_PUBLIC_KEY', '');
    this.secretKey = this.configService.get('FLUTTERWAVE_SECRET_KEY', '');
    this.webhookSecret = this.configService.get('FLUTTERWAVE_WEBHOOK_SECRET', '');
    this.redirectUrl = this.configService.get('FLUTTERWAVE_REDIRECT_URL', 'http://localhost:3000/payment/callback');

    if (this.publicKey && this.secretKey) {
      this.flw = new Flutterwave(this.publicKey, this.secretKey);
      this.logger.log('Flutterwave initialized with live credentials');
    } else {
      this.logger.warn('Flutterwave credentials not configured - payment will fail');
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
    if (!this.flw) {
      throw new Error('Flutterwave not configured. Please set FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY');
    }

    try {
      const reference = `FLW-${data.transactionId}-${Date.now()}`;

      const payload = {
        tx_ref: reference,
        amount: data.amount,
        currency: data.currency,
        redirect_url: this.redirectUrl,
        payment_options: 'card,mobilemoney,ussd,banktransfer',
        customer: {
          email: data.email,
          name: data.metadata?.customerName || 'AfriFund User',
        },
        customizations: {
          title: 'AfriFund Campaign',
          description: `Support: ${data.campaignTitle}`,
          logo: 'https://afrifund.com/logo.png',
        },
        meta: {
          transactionId: data.transactionId,
          campaignTitle: data.campaignTitle,
          ...data.metadata,
        },
      };

      const response = await this.flw.Charge.card(payload);

      if (response.status === 'success') {
        return {
          paymentUrl: response.data.link,
          reference,
        };
      }

      throw new Error(response.message || 'Failed to initialize Flutterwave payment');
    } catch (error) {
      this.logger.error('Flutterwave initialization failed', error);
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
    if (!this.flw) {
      throw new Error('Flutterwave not configured');
    }

    try {
      const response = await this.flw.Transaction.verify({ id: reference });

      if (response.status === 'success') {
        const data = response.data;
        return {
          success: data.status === 'successful',
          amount: data.amount,
          currency: data.currency,
          reference: data.tx_ref,
          status: data.status,
        };
      }

      throw new Error('Failed to verify Flutterwave payment');
    } catch (error) {
      this.logger.error('Flutterwave verification failed', error);
      throw error;
    }
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Flutterwave webhook secret not configured - skipping verification');
      return true; // Allow in dev mode
    }

    if (!signature) {
      return false;
    }

    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
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
      reference: data.tx_ref || data.txRef,
      status: data.status === 'successful' ? 'success' : 'failed',
      amount: parseFloat(data.amount),
      currency: data.currency,
      metadata: {
        transactionId: data.id,
        flutterwaveRef: data.flw_ref,
        paymentType: data.payment_type,
        customer: data.customer,
      },
    };
  }
}
