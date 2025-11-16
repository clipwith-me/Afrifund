import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { FlutterwaveProvider } from './providers/flutterwave.provider';
import { PaystackProvider } from './providers/paystack.provider';
import { MpesaProvider } from './providers/mpesa.provider';
import { MockPaymentProvider } from './providers/mock.provider';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private flutterwaveProvider: FlutterwaveProvider,
    private paystackProvider: PaystackProvider,
    private mpesaProvider: MpesaProvider,
    private mockProvider: MockPaymentProvider,
  ) {}

  async initiatePayment(data: {
    pledgeId: string;
    userId: string;
    amount: number;
    currency: string;
    provider: PaymentProvider;
    metadata?: any;
  }) {
    const pledge = await this.prisma.pledge.findUnique({
      where: { id: data.pledgeId },
      include: { campaign: true },
    });

    if (!pledge) {
      throw new BadRequestException('Pledge not found');
    }

    // Create payment transaction
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        pledgeId: data.pledgeId,
        userId: data.userId,
        provider: data.provider,
        amount: data.amount,
        currency: data.currency,
        status: PaymentStatus.PENDING,
        metadata: data.metadata,
      },
    });

    // Get provider
    const provider = this.getProvider(data.provider);

    // Initialize payment
    const paymentResponse = await provider.initializePayment({
      transactionId: transaction.id,
      amount: data.amount,
      currency: data.currency,
      email: data.metadata?.email || 'user@example.com',
      campaignTitle: pledge.campaign.title,
      metadata: data.metadata,
    });

    // Update transaction with payment URL
    await this.prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        paymentUrl: paymentResponse.paymentUrl,
        providerReference: paymentResponse.reference,
      },
    });

    return {
      transactionId: transaction.id,
      paymentUrl: paymentResponse.paymentUrl,
      reference: paymentResponse.reference,
    };
  }

  async verifyPayment(provider: PaymentProvider, reference: string) {
    const providerInstance = this.getProvider(provider);
    return providerInstance.verifyPayment(reference);
  }

  async handleWebhook(provider: PaymentProvider, payload: any, signature?: string) {
    const providerInstance = this.getProvider(provider);

    // Verify webhook signature
    const isValid = providerInstance.verifyWebhook(payload, signature);
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Parse webhook data
    const webhookData = providerInstance.parseWebhook(payload);

    // Update transaction
    await this.updateTransactionStatus(webhookData);

    return { success: true };
  }

  private async updateTransactionStatus(data: {
    reference: string;
    status: 'success' | 'failed';
    amount: number;
    currency: string;
    metadata?: any;
  }) {
    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: { providerReference: data.reference },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    const status = data.status === 'success' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

    await this.prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status,
        completedAt: data.status === 'success' ? new Date() : null,
        failedAt: data.status === 'failed' ? new Date() : null,
        webhookData: data.metadata,
      },
    });

    return transaction;
  }

  private getProvider(provider: PaymentProvider) {
    switch (provider) {
      case PaymentProvider.FLUTTERWAVE:
        return this.flutterwaveProvider;
      case PaymentProvider.PAYSTACK:
        return this.paystackProvider;
      case PaymentProvider.MPESA:
        return this.mpesaProvider;
      case PaymentProvider.MOCK:
        return this.mockProvider;
      default:
        throw new BadRequestException('Invalid payment provider');
    }
  }

  async getTransactionStatus(transactionId: string) {
    return this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        pledge: {
          include: {
            campaign: true,
          },
        },
      },
    });
  }
}
