import apiClient from './client';

export interface CreatePledgeData {
  campaignId: string;
  amount: number;
  currency?: string;
  message?: string;
  isAnonymous?: boolean;
  paymentProvider: 'FLUTTERWAVE' | 'PAYSTACK' | 'MPESA' | 'MOCK';
}

export const pledgesApi = {
  create: (data: CreatePledgeData) => apiClient.post('/pledges', data),

  getUserPledges: () => apiClient.get('/pledges/my-pledges'),

  getCampaignPledges: (campaignId: string) =>
    apiClient.get(`/pledges/campaign/${campaignId}`),

  getById: (id: string) => apiClient.get(`/pledges/${id}`),

  getStats: () => apiClient.get('/pledges/stats'),
};
