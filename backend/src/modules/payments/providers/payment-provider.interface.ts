export interface PaymentProvider {
  initializePayment(data: {
    transactionId: string;
    amount: number;
    currency: string;
    email: string;
    campaignTitle: string;
    metadata?: any;
  }): Promise<{
    paymentUrl: string;
    reference: string;
  }>;

  verifyPayment(reference: string): Promise<{
    success: boolean;
    amount: number;
    currency: string;
    reference: string;
    status: string;
  }>;

  verifyWebhook(payload: any, signature?: string): boolean;

  parseWebhook(payload: any): {
    reference: string;
    status: 'success' | 'failed';
    amount: number;
    currency: string;
    metadata?: any;
  };
}
