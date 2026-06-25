import apiClient from './client';

export type PaymentProvider = 'FLUTTERWAVE' | 'PAYSTACK' | 'MPESA' | 'MOCK';

export interface VerifyPaymentResponse {
  success: boolean;
  amount: number;
  currency: string;
  reference: string;
  status: string;
  pledgeId?: string;
  campaignId?: string;
}

export const paymentsApi = {
  /**
   * Verify a payment by provider and reference
   */
  verify: (provider: PaymentProvider, reference: string) =>
    apiClient.get<VerifyPaymentResponse>(`/payments/verify/${provider}/${reference}`),
};
